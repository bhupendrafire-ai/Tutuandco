
import React, { createContext, useContext, useState, useEffect } from 'react';
import mockApi from '../api/mockApi';

const ShopContext = createContext();

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error('useShop must be used within a ShopProvider');
    return context;
};

// Image Mapper - Resolves imageName from API to actual asset
const imageModules = import.meta.glob('../assets/heroshots/*.{jpg,png,jpeg}', { eager: true });
// Helper to find image by part of name
export const getProductImage = (namePart) => {
    if (!namePart) return '';
    const images = Object.values(imageModules)
        .map(m => m.default)
        .filter(img => typeof img === 'string');
    return images.find(img => img.includes(namePart)) || images[0];
};

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
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
            const data = await mockApi.getProducts();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to load products", error);
            setProducts([]);
        } finally {
            setLoading(false);
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
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountAmount = coupon ? subtotal * coupon.discount : 0;
        const total = subtotal - discountAmount;
        const shipping = total >= 999 ? 0 : 89;
        return { subtotal, discountAmount, shipping, total: total + shipping };
    };

    const applyCoupon = async (code) => {
        const coupons = await mockApi.getCoupons();
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
        const result = await mockApi.placeOrder(order);
        clearCart();
        setCoupon(null);
        return result;
    };

    const value = {
        products,
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartTotal,
        applyCoupon,
        coupon,
        checkout,
        refreshProducts: loadData
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
