import React, { createContext, useContext, useState, useEffect } from 'react';

// Centralized Policy Defaults (Source of Truth for Fallbacks)
export const POLICY_DEFAULTS = {
    shipping: { 
        id: 'shipping',
        slug: 'shipping',
        title: 'Shipping Policy', 
        navLabel: 'Shipping Info',
        content: `<p>All orders are processed within 1–3 business days. Since each piece is carefully prepared, slight delays during high-demand periods may occur.</p>
<p>Once dispatched, orders typically arrive within:</p>
<ul>
  <li><strong>2–5 business days</strong> for metro cities</li>
  <li><strong>3–7 business days</strong> for other locations</li>
</ul>
<p>Delivery timelines may vary depending on your location and courier partner.</p>
<p>Shipping charges (if applicable) will be calculated at checkout.</p>
<p>Once your order is shipped, you’ll receive a tracking link via email or SMS to follow its journey.</p>
<p>While we work with reliable delivery partners, delays can occasionally happen due to factors beyond our control. If your order is significantly delayed, feel free to reach out to us at <strong>hello.tutuandco@gmail.com</strong>.</p>
<p>Please ensure your shipping details are accurate at checkout. We are not responsible for delays or failed deliveries due to incorrect information.</p>`
    },
    returns: { 
        id: 'returns',
        slug: 'returns',
        title: 'Refund & Cancellation Policy', 
        navLabel: 'Returns & Exchanges',
        content: `<p>As a small, made-with-care brand, we currently do not offer returns or refunds, unless the item received is damaged or incorrect.</p>
<p><strong>To be eligible for exchange:</strong></p>
<ul>
  <li>The product must be unused, unwashed, and in original condition</li>
  <li>Free from pet hair, odour, or any signs of wear</li>
  <li>All tags and packaging must be intact</li>
  </ul>
<p>Please note: Exchange shipping costs are to be borne by the customer. Check our size guide carefully before purchase for the best fit.</p>
<p>If you receive a damaged or wrong item, please contact us within 48 hours of delivery with photos, and we’ll make it right.</p>
<p><strong>Exchange process:</strong> Once your request is approved, the product will need to be shipped back to us. The replacement will be processed after a quality check.</p>
<p>Each piece is handmade, so slight variations are natural and not considered defects.</p>`
    },
    privacy: { 
        id: 'privacy',
        slug: 'privacy',
        title: 'Privacy Policy', 
        navLabel: 'Privacy Policy',
        content: `<p><strong>1. Information We Collect</strong></p>
<p>We collect personal information that you voluntarily provide to us when you place an order, sign up for our newsletter, or contact us. This may include your name, email address, phone number, shipping and billing address, and payment details.</p>
<p><strong>2. How We Use Your Information</strong></p>
<ul>
  <li>Process and fulfill your orders</li>
  <li>Communicate with you regarding your purchases or inquiries</li>
  <li>Provide customer support</li>
  <li>Send updates, offers, or newsletters (only if you opt in)</li>
</ul>
<p>We only use your information for purposes that improve your experience with our brand.</p>
<p><strong>3. Information Sharing</strong></p>
<p>We respect your privacy. Your personal information is never sold, traded, or rented to third parties. We may share necessary details with trusted partners (payment processors, delivery services) strictly to fulfill your orders.</p>
<p><strong>4. Data Security</strong></p>
<p>We take appropriate measures to protect your personal information. All payment transactions are processed through secure, encrypted gateways.</p>
<p><strong>5. Cookies</strong></p>
<p>Our website uses cookies to enhance your browsing experience. These help us understand how you interact with our site and improve functionality.</p>`
    },
    terms: { 
        id: 'terms',
        slug: 'terms',
        title: 'Terms & Conditions', 
        navLabel: 'Terms & Conditions',
        content: `<p><strong>1. Introduction</strong></p>
<p>Welcome to Tutu & Co. By accessing our website and purchasing our products, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.</p>
<p><strong>2. Use of the Website</strong></p>
<p>This website is provided for your personal, non-commercial use. You may not use this site for any purpose that is unlawful or prohibited by these terms.</p>
<p><strong>3. Product Information</strong></p>
<p>We strive to provide accurate descriptions and images of our products. However, due to the handmade nature of our items and variations in screen displays, slight differences may occur. Prices and availability are subject to change without notice.</p>
<p><strong>4. Orders & Payments</strong></p>
<p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order. Payments are processed securely through our authorized payment gateways.</p>
<p><strong>5. Intellectual Property</strong></p>
<p>All content on this website, including designs, text, and images, is the property of Tutu & Co and is protected by copyright and intellectual property laws.</p>
<p><strong>6. Limitation of Liability</strong></p>
<p>Tutu & Co shall not be liable for any direct, indirect, or consequential damages resulting from the use of our products or website.</p>`
    }
};

// Kept for backward compatibility but derived from new source
export const DEFAULT_POLICIES = Object.keys(POLICY_DEFAULTS).reduce((acc, key) => {
    acc[key] = POLICY_DEFAULTS[key].content;
    return acc;
}, { refund: POLICY_DEFAULTS.returns.content });

export const CORE_POLICY_METADATA = Object.values(POLICY_DEFAULTS).map(p => ({
    id: p.id,
    slug: p.slug,
    defaultTitle: p.title,
    defaultNavLabel: p.navLabel
}));

/**
 * Resolves a policy's display label using a hardened fallback chain:
 * 1. Specific navigation label (navLabel)
 * 2. Full official title (title)
 * 3. System-hardcoded fallback (metadata)
 */
export const resolvePolicyLabel = (policyKey, settings) => {
    // Extensive use of optional chaining to prevent crashes during initialization
    const policyData = settings?.policies?.[policyKey];
    const customPolicy = settings?.customPolicies?.find?.(p => p.slug === policyKey);
    const meta = POLICY_DEFAULTS?.[policyKey];

    return (policyData?.navLabel?.trim?.()) || 
           (policyData?.title?.trim?.()) || 
           (customPolicy?.navLabel?.trim?.()) || 
           (customPolicy?.title?.trim?.()) || 
           (meta?.navLabel) || 
           (meta?.title) || 
           'Policy';
};

const ShopContext = createContext();

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within a ShopProvider");
    return context;
};

// Harden environment access with optional chaining to prevent top-level module failure
const VITE_API_URL = import.meta?.env?.VITE_API_URL;
const IS_PROD = import.meta?.env?.PROD;
const FALLBACK_URL = 'https://tutuandco-production.up.railway.app'; // Stable production fallback

// Auto-detect or use hardcoded fallback
let resolvedUrl = VITE_API_URL || FALLBACK_URL;

if (resolvedUrl && !resolvedUrl.startsWith('http')) {
    resolvedUrl = `https://${resolvedUrl}`;
}

export const FINAL_API_URL = resolvedUrl?.replace(/\/$/, "");

if (IS_PROD) {
    if (!VITE_API_URL) {
        console.warn("🛡️ API FALLBACK: VITE_API_URL was undefined. Using hardcoded production URL.");
    }
    console.log("🛠️ Build Connectivity:", { 
        has_api_url: !!VITE_API_URL, 
        resolved_url: FINAL_API_URL 
    });
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
        categories: ['Accessories', 'Toys', 'Beds'],
        policies: {}, // Hardened normalized structure
        customPolicies: []
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
                rating: Number(prod.rating) || 5,
                sizeVariants: Array.isArray(prod.sizeVariants) ? prod.sizeVariants : []
            }));
            const b = bannerRes.ok ? await bannerRes.json() : [];
            const m = mediaRes.ok ? await mediaRes.json() : [];
            const o = orderRes.ok ? await orderRes.json() : [];
            const s = settingsRes.ok ? await settingsRes.json() : {};

            // --- HARDENED POLICY MIGRATION & NORMALIZATION ---
            const normalizedPolicies = { ...(s.policies || {}) };
            
            CORE_POLICY_METADATA.forEach(meta => {
                const key = meta.id;
                // Legacy Map: shippingPolicy -> policies.shipping
                const legacyKey = `${key}Policy`; 
                
                if (!normalizedPolicies[key]) {
                    normalizedPolicies[key] = {
                        title: s[`${legacyKey}_title`] || meta.defaultTitle,
                        navLabel: s[`${legacyKey}_navLabel`] || meta.defaultNavLabel,
                        content: s[legacyKey] || DEFAULT_POLICIES[key] || ''
                    };
                }
                
                // Ensure migration of any partial existing data
                if (typeof normalizedPolicies[key] === 'string') {
                    normalizedPolicies[key] = {
                        title: meta.defaultTitle,
                        navLabel: meta.defaultNavLabel,
                        content: normalizedPolicies[key]
                    };
                }
            });

            const mergedSettings = {
                currency: { code: 'INR', symbol: '₹', rate: 1 },
                globalDiscount: 0,
                shopName: 'Tutu & Co',
                ...s,
                policies: normalizedPolicies,
                customPolicies: s.customPolicies || []
            };

            setProducts(p || []);
            setBanners(b || []);
            setMedia(m || []);
            setOrders(Array.isArray(o) ? o : []);
            setSettings(mergedSettings);
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
                body: JSON.stringify({
                    ...product,
                    sizeVariants: product.sizeVariants || [
                        { size: 'S', stock: 0 },
                        { size: 'M', stock: 0 }
                    ]
                })
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

    const addToCart = (product, quantity = 1, selectedSize = null) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id && item.selectedSize === selectedSize);
            if (existing) {
                return prev.map(item => 
                    (item.id === product.id && item.selectedSize === selectedSize) ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { ...product, quantity, selectedSize }];
        });
    };

    const removeFromCart = (productId, size = null) => {
        setCart(prev => prev.filter(item => !(item.id === productId && item.selectedSize === size)));
    };

    const updateCartQuantity = (productId, quantity, size = null) => {
        if (quantity < 1) return removeFromCart(productId, size);
        setCart(prev => prev.map(item => 
            (item.id === productId && item.selectedSize === size) ? { ...item, quantity } : item
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
