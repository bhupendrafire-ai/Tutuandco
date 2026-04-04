import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within a ShopProvider");
    return context;
};

// Only use fallback in development if VITE_API_URL is missing
// We use static constants to ensure Vite's string replacement works perfectly in production
const VITE_API_URL = import.meta.env.VITE_API_URL;
const IS_PROD = import.meta.env.PROD;
const FALLBACK_URL = 'http://localhost:3001';

// Auto-fix missing protocol OR Auto-detect for the live domain if variable was missed in build
let resolvedUrl = VITE_API_URL;

if (!resolvedUrl && IS_PROD && typeof window !== 'undefined') {
    const isLiveSite = window.location.hostname === 'www.tutuandco.in' || window.location.hostname === 'tutuandco.in';
    if (isLiveSite) {
        resolvedUrl = 'https://tutuandco-production.up.railway.app';
        console.warn("🛡️ AUTO-DETECT: Connected to production backend via domain fallback.");
    }
}

if (resolvedUrl && !resolvedUrl.startsWith('http')) {
    resolvedUrl = `https://${resolvedUrl}`;
}

export const FINAL_API_URL = (resolvedUrl || (IS_PROD ? '' : FALLBACK_URL))?.replace(/\/$/, "");

if (IS_PROD) {
    console.log("🛠️ Production Build Info:", { 
        has_api_url: !!VITE_API_URL, 
        resolved_url: FINAL_API_URL 
    });
    if (!VITE_API_URL) {
        console.error("❌ CRITICAL: VITE_API_URL is undefined in this build. Please Redeploy on Vercel with 'Clear Cache'.");
    }
}

// Image Mapper - Resolves imageName from API to actual asset
const imageModules = import.meta.glob('../assets/heroshots/*.{jpg,png,jpeg}', { eager: true });
// Helper to find image by part of name
export const getProductImage = (namePart, customMedia = []) => {
    const segment = String(namePart || '');
    if (!segment) return '';
    
    // Check if it's already a full URL (Vercel Blob)
    if (segment.startsWith('http')) return segment;

    // Check custom media first (uploaded via CMS)
    const safeMedia = Array.isArray(customMedia) ? customMedia : [];
    const uploaded = safeMedia.find(m => m.name === segment || m.url === segment);
    if (uploaded) return uploaded.url;

    // Build resolution pool from local assets
    const images = Object.values(imageModules)
        .map(m => m.default)
        .filter(img => typeof img === 'string');

    if (images.length === 0) return '';

    const found = images.find(img => img.includes(segment));
    if (found) return found;

    // Last resort fallback: Stable fallback based on name hash
    try {
        const index = Math.abs(segment.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % images.length;
        return images[index] || images[0];
    } catch (e) {
        return images[0] || '';
    }
};

export const formatPrice = (amount, settings) => {
    const val = Number(amount) || 0;
    if (!settings || !settings.currency) return `₹${val.toFixed(2)}`;
    const { symbol, rate } = settings.currency;
    const safeRate = Number(rate) || 1;
    return `${symbol || '₹'}${(val * safeRate).toFixed(2)}`;
};

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [media, setMedia] = useState([]);
    const [cart, setCart] = useState([]);
    const [settings, setSettings] = useState({
        currency: { code: 'INR', symbol: '₹', rate: 1 },
        globalDiscount: 0,
        shopName: 'Tutu & Co',
        categories: ['Accessories', 'Toys', 'Beds']
    });
    const [loading, setLoading] = useState(true);
    const [coupon, setCoupon] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        loadData();
        try {
            const savedCart = localStorage.getItem('tutu_cart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed)) setCart(parsed);
            }
        } catch (e) {
            console.error("Cart recovery failed", e);
            setCart([]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('tutu_cart', JSON.stringify(cart));
    }, [cart]);

    const loadData = async () => {
        if (!FINAL_API_URL) {
            console.error("API_URL is not configured for this environment.");
            setLoading(false);
            return;
        }

        try {
            const [productRes, bannerRes, mediaRes, settingsRes, orderRes] = await Promise.all([
                fetch(`${FINAL_API_URL}/api/products`),
                fetch(`${FINAL_API_URL}/api/banners`),
                fetch(`${FINAL_API_URL}/api/media`),
                fetch(`${FINAL_API_URL}/api/settings`),
                fetch(`${FINAL_API_URL}/api/orders`)
            ]);
            
            const rawProducts = productRes.ok ? await productRes.json() : [];
            const p = rawProducts.map(prod => ({
                ...prod,
                price: Number(prod.price) || 0,
                discountPrice: prod.discountPrice ? Number(prod.discountPrice) : null,
                rating: Number(prod.rating) || 5
            }));
            const b = bannerRes.ok ? await bannerRes.json() : [];
            const m = mediaRes.ok ? await mediaRes.json() : [];
            const o = orderRes.ok ? await orderRes.json() : [];
            const s = settingsRes.ok ? await settingsRes.json() : {
                currency: { code: 'INR', symbol: '₹', rate: 1 },
                globalDiscount: 0,
                shopName: 'Tutu & Co'
            };

            setProducts(p || []);
            setBanners(b || []);
            setMedia(m || []);
            setOrders(Array.isArray(o) ? o : []);
            setSettings(s || {
                currency: { code: 'INR', symbol: '₹', rate: 1 },
                globalDiscount: 0,
                shopName: 'Tutu & Co'
            });
        } catch (error) {
            console.error("Failed to load shop data from server", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (newSettings) => {
        if (!FINAL_API_URL) return;
        try {
            const res = await fetch(`${FINAL_API_URL}/api/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            const data = await res.json();
            if (data && typeof data === 'object') setSettings(data);
            return data;
        } catch (err) {
            console.error("Settings update failed", err);
        }
    };

    const addProduct = async (product) => {
        if (!FINAL_API_URL) {
            console.error("❌ API_URL is not configured. Cannot add product.");
            return;
        }
        try {
            const res = await fetch(`${FINAL_API_URL}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`API returned ${res.status}: ${errorData.message || 'Unknown error'}`);
            }
            const newProduct = await res.json();
            await loadData();
            return newProduct;
        } catch (err) {
            console.error("❌ Failed to add product:", err.message);
            // Optionally, you might want to set loading to false or show a user-facing error
            throw err; // Re-throw to allow caller to handle
        }
    };

    const deleteProduct = async (id) => {
        if (!FINAL_API_URL) return;
        try {
            await fetch(`${FINAL_API_URL}/api/products/${id}`, { method: 'DELETE' });
            await loadData();
        } catch (err) {
            console.error("Delete product failed", err);
        }
    };

    const updateProduct = async (id, updates) => {
        if (!FINAL_API_URL) return;
        try {
            await fetch(`${FINAL_API_URL}/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            await loadData();
        } catch (err) {
            console.error("Update product failed", err);
        }
    };

    const updateBanners = async (newBanners, immediate = false) => {
        setBanners(newBanners); // Optimistic Update for instant UI feedback
        if (!FINAL_API_URL) return;

        // Clear existing debounce
        if (window._bannerDebounce) {
            clearTimeout(window._bannerDebounce);
            window._bannerDebounce = null;
        }

        const sync = async () => {
            try {
                const res = await fetch(`${FINAL_API_URL}/api/banners`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBanners)
                });
                const result = await res.json();
                console.log("SAVED BANNERS (DB SUCCESS):", result);
                return result;
            } catch (err) {
                console.error("Banner synchronization failed", err);
                throw err;
            }
        };

        if (immediate) {
            return sync();
        } else {
            // Schedule new persistence
            return new Promise((resolve) => {
                window._bannerDebounce = setTimeout(async () => {
                    const result = await sync();
                    window._bannerDebounce = null;
                    resolve(result);
                }, 500); // Wait 500ms before sending to server
            });
        }
    };

    const uploadMedia = async (url, name) => {
        if (!FINAL_API_URL) return;
        try {
            const res = await fetch(`${FINAL_API_URL}/api/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, name })
            });
            const newMedia = await res.json();
            await loadData();
            return newMedia;
        } catch (err) {
            console.error("Media upload reference failed", err);
        }
    };

    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateCartQuantity = (productId, quantity) => {
        if (quantity < 1) return removeFromCart(productId);
        setCart(prev => prev.map(item => 
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        const safeCart = Array.isArray(cart) ? cart : [];
        const subtotal = safeCart.reduce((sum, item) => sum + ((Number(item.discountPrice || item.price) || 0) * (item.quantity || 0)), 0);
        const safeSettings = settings || {};
        const globalDiscountAmount = safeSettings.globalDiscount ? subtotal * (safeSettings.globalDiscount / 100) : 0;
        const couponDiscountAmount = coupon ? (subtotal - globalDiscountAmount) * (Number(coupon.discount) || 0) : 0;
        const totalDiscount = globalDiscountAmount + couponDiscountAmount;
        const total = subtotal - totalDiscount;
        const shipping = total >= 999 ? 0 : 89;
        return { subtotal, discountAmount: totalDiscount, shipping, total: total + shipping };
    };

    const applyCoupon = async (code) => {
        // Simplified coupon logic for phase 2 - still client side but matching structure
        const coupons = [{ code: 'TUTU10', discount: 0.1, minSpend: 500 }];
        const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (found && subtotal >= found.minSpend) {
            setCoupon(found);
            return { success: true, message: `Coupon ${code} applied!` };
        }
        return { success: false, message: 'Invalid coupon or minimum spend not met' };
    };

    const checkout = async (details) => {
        if (!FINAL_API_URL) return { success: false, message: 'Service temporarily unavailable' };
        try {
            const { subtotal, discountAmount, shipping, total } = getCartTotal();
            const order = {
                items: cart,
                ...details,
                subtotal,
                discountAmount,
                shipping,
                total,
                couponCode: coupon?.code
            };
            const res = await fetch(`${FINAL_API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            const result = await res.json();
            clearCart();
            setCoupon(null);
            return result || { success: true };
        } catch (err) {
            console.error("Checkout submission failed", err);
            return { success: false, message: "Order submission failed. Please check your connection." };
        }
    };

    const shipOrder = async (id, shippingDetails) => {
        if (!FINAL_API_URL) return;
        try {
            const res = await fetch(`${FINAL_API_URL}/api/orders/${id}/ship`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(shippingDetails)
            });
            const result = await res.json();
            await loadData();
            return result;
        } catch (err) {
            console.error("Ship order failed", err);
        }
    };

    const value = {
        products,
        banners,
        media,
        orders,
        loading,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartTotal,
        applyCoupon,
        coupon,
        checkout,
        shipOrder,
        addProduct,
        deleteProduct,
        updateProduct,
        updateBanners,
        uploadMedia,
        settings,
        updateSettings,
        formatPrice: (amt) => formatPrice(amt, settings),
        refreshData: loadData
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
