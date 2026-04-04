
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useShop, getProductImage } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { cart, removeFromCart, updateCartQuantity, getCartTotal, applyCoupon, coupon, formatPrice, settings, media } = useShop();
    const { subtotal, discountAmount, shipping, total } = getCartTotal();

    if (cart.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-brand-sage">
                <div className="w-24 h-24 bg-brand-cream rounded-full flex items-center justify-center mb-8 shadow-sm">
                    <ShoppingBag size={40} className="text-brand-charcoal/20" />
                </div>
                <h2 className="text-3xl font-medium text-brand-charcoal mb-4">Your cart is empty</h2>
                <p className="text-brand-charcoal/60 mb-12 text-center max-w-md">
                    Explore our collections and find the perfect pieces for your best friend.
                </p>
                <Link to="/" className="bg-brand-rose text-brand-charcoal px-16 py-8 text-[18px] font-medium hover:bg-white transition-all shadow-md">
                    Start shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-brand-sage min-h-screen pt-24 pb-32">
            <div className="page-container">
                <h1 className="text-4xl md:text-5xl font-medium text-brand-charcoal mb-16">Shopping bag</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-8">
                        <AnimatePresence>
                            {(Array.isArray(cart) ? cart : []).map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col sm:flex-row items-center gap-8 py-8 border-b border-brand-charcoal/10"
                                >
                                    <div className="w-32 h-40 bg-brand-cream rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
                                        <img 
                                            src={getProductImage(Array.isArray(item.images) ? item.images[0]?.url : item.imageName, media)} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-grow text-center sm:text-left">
                                        <span className="text-[11px] font-medium text-brand-charcoal opacity-40 mb-3 block">{item.category}</span>
                                        <h3 className="text-xl font-medium text-brand-charcoal mb-2">{item.name}</h3>
                                        <div className="flex flex-col items-start gap-1">
                                            <p className="text-brand-charcoal font-medium text-sm">
                                                {formatPrice(item.discountPrice || item.price)}
                                            </p>
                                            {item.discountPrice && (
                                                <p className="text-[10px] opacity-20 line-through text-brand-charcoal">
                                                    {formatPrice(item.price)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6">
                                        <div className="flex items-center border border-brand-charcoal/20 rounded-sm bg-brand-cream/30">
                                            <button 
                                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                className="p-3 hover:bg-brand-sage/50 text-brand-charcoal/60"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center text-sm font-medium text-brand-charcoal">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                className="p-3 hover:bg-brand-sage/50 text-brand-charcoal/60"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-brand-charcoal/30 hover:text-brand-rose transition-colors p-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit bg-brand-cream/80 backdrop-blur-sm p-10 rounded-sm shadow-sm">
                        <h3 className="text-2xl font-medium text-brand-charcoal mb-8 pb-4 border-b border-brand-charcoal/10">Order summary</h3>
                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between text-sm">
                                <span className="text-brand-charcoal/60">Subtotal</span>
                                <span className="text-brand-charcoal font-medium">{formatPrice(subtotal)}</span>
                            </div>

                            {coupon && (
                                <div className="flex justify-between text-sm text-brand-charcoal font-medium">
                                    <span>Discount ({coupon.code})</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm">
                                <span className="text-brand-charcoal/60">Shipping</span>
                                <span className="text-brand-charcoal font-medium">
                                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                                </span>
                            </div>

                                <p className="text-[11px] text-brand-charcoal/60 italic font-medium">
                                    Spend {formatPrice(Math.max(0, 999 - (Number(total) || 0) + (Number(shipping) || 0)))} more for FREE shipping.
                                </p>

                            <div className="pt-6 border-t border-brand-charcoal/10 flex justify-between items-end">
                                <span className="text-[11px] font-medium text-brand-charcoal">Total</span>
                                <span className="text-3xl font-medium text-brand-charcoal">{formatPrice(total)}</span>
                            </div>
                        </div>

                        {/* Coupon Form */}
                        <form className="mb-8" onSubmit={(e) => {
                            e.preventDefault();
                            const code = e.target.coupon.value;
                            applyCoupon(code).then(res => alert(res.message));
                            e.target.coupon.value = '';
                        }}>
                             <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-3">Promo code</label>
                             <div className="flex gap-2">
                                <input 
                                    name="coupon"
                                    type="text" 
                                    placeholder="Enter code" 
                                    className="flex-grow bg-brand-sage/20 border border-brand-charcoal/10 px-4 py-3 text-sm focus:outline-none focus:border-brand-charcoal"
                                />
                                <button type="submit" className="bg-brand-rose text-brand-charcoal px-6 py-3 text-[11px] font-medium hover:bg-white transition-colors shadow-sm">Apply</button>
                             </div>
                        </form>

                        <Link 
                            to="/checkout" 
                            className="w-full bg-brand-rose text-brand-charcoal py-8 flex items-center justify-center font-medium text-[18px] hover:bg-white transition-all shadow-lg group"
                        >
                            Checkout summary
                            <ArrowRight size={20} className="ml-4 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="mt-8 flex items-center justify-center space-x-6 opacity-40 grayscale">
                             {/* Mock Payment Icons */}
                             <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-medium text-[8px]">VISA</div>
                             <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-medium text-[8px]">MC</div>
                             <div className="w-8 h-8 rounded-full border border-black flex items-center justify-center font-medium text-[8px]">UPi</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
