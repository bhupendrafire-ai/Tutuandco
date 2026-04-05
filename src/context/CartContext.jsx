import React, { createContext, useContext, useState, useEffect } from 'react';
import { FINAL_API_URL } from './apiConfig';

/**
 * CartContext
 * Manages shopping cart state, coupon logic, and checkout flow.
 * Separated from ShopContext for cleaner domain isolation.
 */
const CartContext = createContext();

export { CartContext };

// Direct hook for components that only need cart data
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};

/**
 * CartProvider
 * @param {Object} settings - Store settings from ShopContext (needed for discount calculations)
 */
export const CartProvider = ({ children, settings, products }) => {
    const [cart, setCart] = useState([]);
    const [coupon, setCoupon] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // 1. Load saved cart from localStorage on mount (Initialization Phase)
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('tutu_cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) {
                    // PROACTIVE SANITIZATION: Filter out stale items with missing IDs 
                    // This automatically flushes out the "undefined" products from the previous bug.
                    const sanitized = parsed.filter(item => {
                        const isValid = item.id || item.productId;
                        if (!isValid) {
                            console.warn("[CART] Auto-flushing stale item with missing ID:", item.name || "Unknown Item");
                        }
                        return isValid;
                    });
                    setCart(sanitized);
                }
            }
        } catch (e) {
            console.error("Cart recovery failed", e);
        } finally {
            setIsInitialized(true); // Signal that initial load is complete
        }
    }, []);

    // 2. Persist cart to localStorage on every change (Persistence Phase)
    // Critical: only saves if isInitialized is true to prevent overwriting with [] on refresh
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('tutu_cart', JSON.stringify(cart));
        }
    }, [cart, isInitialized]);

    // Add item to cart (strictly matches by productId + variantId)
    // Now returns boolean for UI feedback
    // Destructure `id` (matches PostgreSQL schema — NOT MongoDB `_id`)
    const addToCart = ({ id: productId, size: sizeLabel, price: customPrice, quantity = 1 }) => {
        console.log("[CART] addToCart called", { productId, sizeLabel, quantity });

        if (!sizeLabel) {
            console.error(`[CART_ERROR] Missing size for product "${productId}". Aborting.`);
            return false;
        }

        // Lookup by `id` (PostgreSQL column name, not `_id`)
        const product = (products || []).find(p => String(p.id) === String(productId));
        if (!product) {
            console.error(`[CART_ERROR] Product "${productId}" not found in current shop data.`);
            return false;
        }

        const variants = product.variants || [];
        const variant = variants.find(v => v.size === sizeLabel);
        
        const finalPrice = customPrice !== undefined ? customPrice : (variant?.price ?? (product.discountPrice || product.price));
        
        setCart(prev => {
            const existing = prev.find(item => 
                (item.productId === productId || item.id === productId) && 
                item.size === sizeLabel
            );
            
            if (existing) {
                return prev.map(item => 
                    ((item.productId === productId || item.id === productId) && item.size === sizeLabel) 
                        ? { ...item, quantity: item.quantity + quantity, price: finalPrice } 
                        : item
                );
            }

            // Store product.id and variant.id (PostgreSQL fields, not _id)
            return [...prev, {
                id: product.id,
                productId: product.id,
                name: product.name,
                category: product.category,
                imageName: product.imageName,
                images: product.images,
                size: sizeLabel,
                variantId: variant?.id,
                quantity,
                price: finalPrice
            }];
        });

        console.log("[CART] Successfully added/updated item:", { name: product.name, size: sizeLabel });
        return true;
    };

    // Remove specific item (Strictly productId + variantId based)
    const removeFromCart = (productId, size) => {
        setCart(prev => prev.filter(item => 
            !((item.productId === productId || item.id === productId) && item.size === size)
        ));
    };

    // Update quantity (Strictly productId + variantId based)
    const updateCartQuantity = (productId, size, quantity) => {
        if (quantity < 1) return removeFromCart(productId, size);
        setCart(prev => prev.map(item => 
            ((item.productId === productId || item.id === productId) && item.size === size) 
                ? { ...item, quantity } 
                : item
        ));
    };

    // Clear all items from cart
    const clearCart = () => setCart([]);

    // Calculate cart totals including discounts and shipping
    const getCartTotal = () => {
        const safeCart = Array.isArray(cart) ? cart : [];
        const subtotal = safeCart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 0)), 0);
        const safeSettings = settings || {};
        const globalDiscountAmount = safeSettings.globalDiscount ? subtotal * (safeSettings.globalDiscount / 100) : 0;
        const couponDiscountAmount = coupon ? (subtotal - globalDiscountAmount) * (Number(coupon.discount) || 0) : 0;
        const totalDiscount = globalDiscountAmount + couponDiscountAmount;
        const total = subtotal - totalDiscount;
        const shipping = total >= 999 ? 0 : 89;
        return { subtotal, discountAmount: totalDiscount, shipping, total: total + shipping };
    };

    // Refresh cart prices against latest server data
    const refreshCartPrices = async () => {
        try {
            const response = await fetch(`${FINAL_API_URL}/api/products`);
            const latestProducts = await response.json();
            
            let hasChanges = false;
            const updatedCart = cart.map(item => {
                // Ensure lookup works for both legacy and new schema
                const latestProduct = latestProducts.find(p => p.id === (item.productId || item.id));
                if (!latestProduct) return item;
                
                const latestVariant = (latestProduct.variants || []).find(v => v.size === item.size);
                
                if (!latestVariant) {
                    console.error(`[CART_SYNC_ERROR] Size "${item.size}" for product "${item.productId || item.id}" no longer exists on server.`);
                    return item;
                }

                const latestPrice = latestVariant.price !== undefined ? latestVariant.price : (latestProduct.discountPrice || latestProduct.price);
                const latestSize = latestVariant.size || 'Standard';
                
                // Migrating old schema to include productId and updating price/size if changed
                if (latestPrice !== item.price || latestSize !== item.size || !item.productId) {
                    hasChanges = true;
                    return { 
                        ...item, 
                        productId: latestProduct.id, 
                        price: latestPrice, 
                        size: latestSize 
                    };
                }
                return item;
            });
            
            if (hasChanges) {
                setCart(updatedCart);
                return { updated: true, message: "Your cart data has been synchronized with the latest inventory." };
            }
            return { updated: false };
        } catch (error) {
            console.error("Failed to refresh cart prices:", error);
            return { updated: false, error };
        }
    };

    // Apply a coupon code
    const applyCoupon = async (code) => {
        const coupons = [{ code: 'TUTU10', discount: 0.1, minSpend: 500 }];
        const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (found && subtotal >= found.minSpend) {
            setCoupon(found);
            return { success: true, message: `Coupon ${code} applied!` };
        }
        return { success: false, message: 'Invalid coupon or minimum spend not met' };
    };

    // Two-stage checkout: Create → Confirm (with idempotency)
    const checkout = async (details) => {
        if (!FINAL_API_URL) return { success: false, message: 'Service temporarily unavailable' };
        
        const createKey = `create_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const confirmKey = `confirm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            const { subtotal, discountAmount, shipping, total } = getCartTotal();

            console.log("CART RAW:", cart);

            // Sanitize cart items to only include fields the backend expects
            // Include BOTH `id` and `productId` for full backend compatibility:
            //   - Production backend reads `item.id`
            //   - Updated backend reads `item.productId || item.id`
            // Include `size` for variant fallback lookup when variantId is missing
            const resolvedId = (item) => item.productId || item.id;
            const sanitizedItems = cart.map(item => ({
                id: resolvedId(item),
                productId: resolvedId(item),
                variantId: item.variantId,
                size: item.size,
                quantity: item.quantity,
                price: item.price
            }));
            
            console.log("SANITIZED ITEMS:", JSON.stringify(sanitizedItems, null, 2));
            const orderPayload = {
                items: sanitizedItems,
                ...details,
                subtotal,
                discountAmount,
                shipping,
                total,
                couponCode: coupon?.code,
                idempotencyKey: createKey
            };

            console.log("ORDER PAYLOAD", orderPayload);

            // Stage 1: Create Order (Validation only)
let createRes;

try {
  createRes = await fetch(`${FINAL_API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });

  const text = await createRes.clone().text();
  console.log("RAW RESPONSE:", text);

  if (!createRes.ok) {
    alert(text);
    return;
  }

} catch (err) {
  console.error("FRONTEND ERROR:", err);
  return;
}

            const createResult = await createRes.json();
            
            if (!createRes.ok) {
                return { 
                    success: false, 
                    message: createResult.error || "Order creation failed",
                    code: createResult.code 
                };
            }

            // Stage 2: Confirm Order (Stock Deduction)
            const confirmRes = await fetch(`${FINAL_API_URL}/api/orders/${createResult.id}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ confirmationKey: confirmKey })
            });

            const confirmResult = await confirmRes.json();

            if (!confirmRes.ok) {
                return { 
                    success: false, 
                    message: confirmResult.error || "Confirmation failed",
                    code: confirmResult.code,
                    orderId: createResult.id
                };
            }

            clearCart();
            setCoupon(null);
            return { success: true, order: confirmResult };
        } catch (err) {
            console.error("Checkout process failed", err);
            return { success: false, message: "Checkout failed. Please check your connection." };
        }
    };

    const value = {
        cart,
        coupon,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        refreshCartPrices,
        applyCoupon,
        checkout
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
