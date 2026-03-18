
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useShop, getProductImage } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { cart, removeFromCart, updateCartQuantity, getCartTotal, applyCoupon, coupon, formatPrice, settings } = useShop();
    const { subtotal, discountAmount, shipping, total } = getCartTotal();

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-white">
                <div className="w-24 h-24 bg-[#F8F4F0] rounded-full flex items-center justify-center mb-8">
                    <ShoppingBag size={40} className="text-[#95714F]/40" />
                </div>
                <h2 className="text-3xl font-serif text-black mb-4">Your cart is empty</h2>
                <p className="text-[#95714F] mb-12 text-center max-w-md">
                    Explore our collections and find the perfect pieces for your best friend.
                </p>
                <Link to="/" className="bg-black text-white px-12 py-5 rounded-sm tracking-[0.2em] text-xs uppercase font-bold hover:bg-[#1a1a1a] transition-all">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-serif text-black mb-16">Your Shopping Bag</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-8">
                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col sm:flex-row items-center gap-8 py-8 border-b border-[#EADED0]"
                                >
                                    <div className="w-32 h-40 bg-[#F8F4F0] rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
                                        <img 
                                            src={getProductImage(item.images?.[0]?.url || item.imageName)} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-grow text-center sm:text-left">
                                        <span className="text-[10px] uppercase tracking-widest text-[#8C916C] font-bold mb-2 block">{item.category}</span>
                                        <h3 className="text-xl font-serif text-black mb-4">{item.name}</h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
                                            <p className="text-[#CD664D] font-bold">
                                                {formatPrice(item.discountPrice || item.price)}
                                            </p>
                                            {item.discountPrice && (
                                                <p className="text-sm opacity-30 line-through">
                                                    {formatPrice(item.price)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center border border-[#C7AF94] rounded-sm bg-white">
                                            <button 
                                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                className="p-3 hover:bg-[#F8F4F0] text-[#95714F]"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center text-sm font-medium text-black">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                className="p-3 hover:bg-[#F8F4F0] text-[#95714F]"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-[#95714F]/40 hover:text-red-500 transition-colors p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit bg-[#F8F4F0] p-10 rounded-sm">
                        <h3 className="text-2xl font-serif text-black mb-8 pb-4 border-b border-[#C7AF94]/20">Order Summary</h3>
                        
                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#95714F]">Subtotal</span>
                                <span className="text-black font-medium">{formatPrice(subtotal)}</span>
                            </div>

                            {coupon && (
                                <div className="flex justify-between text-sm text-[#8C916C]">
                                    <span>Discount ({coupon.code})</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-[#95714F]">Shipping</span>
                                <span className="text-black font-medium">
                                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                                </span>
                            </div>

                            {shipping > 0 && (
                                <p className="text-[10px] text-[#95714F]/60 italic font-light">
                                    Spend {formatPrice(999 - total + shipping)} more for FREE shipping.
                                </p>
                            )}

                            <div className="pt-6 border-t border-[#C7AF94]/20 flex justify-between items-end">
                                <span className="text-lg font-serif text-black uppercase tracking-widest text-[10px]">Total</span>
                                <span className="text-3xl font-serif text-black font-medium">{formatPrice(total)}</span>
                            </div>
                        </div>

                        {/* Coupon Form */}
                        <form className="mb-8" onSubmit={(e) => {
                            e.preventDefault();
                            const code = e.target.coupon.value;
                            applyCoupon(code).then(res => alert(res.message));
                            e.target.coupon.value = '';
                        }}>
                             <label className="block text-[10px] uppercase font-bold text-[#95714F] tracking-widest mb-3">Promo Code</label>
                             <div className="flex gap-2">
                                <input 
                                    name="coupon"
                                    type="text" 
                                    placeholder="Enter code" 
                                    className="flex-grow bg-white border border-[#C7AF94]/30 px-4 py-3 text-sm focus:outline-none focus:border-[#95714F]"
                                />
                                <button type="submit" className="bg-[#95714F] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#8C916C] transition-colors">Apply</button>
                             </div>
                        </form>

                        <Link 
                            to="/checkout" 
                            className="w-full bg-black text-white py-5 flex items-center justify-center font-medium tracking-[0.2em] uppercase text-xs hover:bg-[#1a1a1a] transition-all group"
                        >
                            Checkout Summary
                            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="mt-8 flex items-center justify-center space-x-6 opacity-40 grayscale">
                             {/* Mock Payment Icons */}
                             <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-[8px]">VISA</div>
                             <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-[8px]">MC</div>
                             <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-bold text-[8px]">UPi</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
