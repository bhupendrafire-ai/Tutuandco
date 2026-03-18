import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within a ShopProvider");
    return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Image Mapper - Resolves imageName from API to actual asset
const imageModules = import.meta.glob('../assets/heroshots/*.{jpg,png,jpeg}', { eager: true });
// Helper to find image by part of name
export const getProductImage = (namePart, customMedia = []) => {
    if (!namePart) return '';
    
    // Check if it's already a full URL (Vercel Blob)
    if (namePart.startsWith('http')) return namePart;

    // Check custom media first (uploaded via CMS)
    const uploaded = customMedia.find(m => m.name === namePart || m.url === namePart);
    if (uploaded) return uploaded.url;

    // Build resolution pool from local assets
    const images = Object.values(imageModules)
        .map(m => m.default)
        .filter(img => typeof img === 'string');

    const found = images.find(img => img.includes(namePart));
    if (found) return found;

    // Last resort fallback: Stable fallback based on name hash
    const index = Math.abs(namePart.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % images.length;
    return images[index] || images[0];
};

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [media, setMedia] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [coupon, setCoupon] = useState(null);

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
        try {
            const [productRes, bannerRes, mediaRes] = await Promise.all([
                fetch(`${API_URL}/api/products`),
                fetch(`${API_URL}/api/banners`),
                fetch(`${API_URL}/api/media`)
            ]);
            
            const p = await productRes.json();
            const b = await bannerRes.json();
            const m = await mediaRes.json();

            setProducts(p || []);
            setBanners(b || []);
            setMedia(m || []);
        } catch (error) {
            console.error("Failed to load shop data from server", error);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (product) => {
        const res = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        const newProduct = await res.json();
        await loadData();
        return newProduct;
    };

    const deleteProduct = async (id) => {
        await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
        await loadData();
    };

    const updateProduct = async (id, updates) => {
        await fetch(`${API_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        await loadData();
    };

    const updateBanners = async (newBanners) => {
        await fetch(`${API_URL}/api/banners`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newBanners)
        });
        await loadData();
    };

    const uploadMedia = async (url, name) => {
        const res = await fetch(`${API_URL}/api/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, name })
        });
        const newMedia = await res.json();
        await loadData();
        return newMedia;
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
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = coupon ? subtotal * coupon.discount : 0;
        const total = subtotal - discountAmount;
        const shipping = total >= 999 ? 0 : 89;
        return { subtotal, discountAmount, shipping, total: total + shipping };
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
        const res = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        const result = await res.json();
        clearCart();
        setCoupon(null);
        return result;
    };

    const value = {
        products,
        banners,
        media,
        loading,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartTotal,
        applyCoupon,
        coupon,
        checkout,
        addProduct,
        deleteProduct,
        updateProduct,
        updateBanners,
        uploadMedia,
        refreshData: loadData
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
