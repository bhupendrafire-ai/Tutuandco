
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop, getProductImage } from '../context/ShopContext';
import { CheckCircle, Truck, FileText, CreditCard, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
    const { cart, getCartTotal, checkout, formatPrice, settings, media } = useShop();
    const { subtotal, discountAmount, shipping, total } = getCartTotal();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', city: '', state: '', zip: ''
    });
    const [orderResult, setOrderResult] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await checkout(orderDetails);
            setOrderResult(result);
            setStep(3); // Confirmation
        } catch (error) {
            alert("Checkout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if ((!Array.isArray(cart) || cart.length === 0) && step !== 3) {
        navigate('/cart');
        return null;
    }
    
    // Safety check for totals
    const safeTotal = Number(total) || 0;
    const safeShipping = Number(shipping) || 0;
    const safeSubtotal = Number(subtotal) || 0;
    const safeDiscount = Number(discountAmount) || 0;

    return (
        <div className="bg-brand-sage min-h-screen pt-24 pb-32">
            <div className="max-w-[1440px] mx-auto px-3">
                
                {/* Progress Bar */}
                <div className="flex items-center justify-center mb-16 space-x-4 max-w-xl mx-auto">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${step >= s ? 'bg-brand-rose border-brand-rose text-brand-charcoal shadow-sm' : 'bg-white border-brand-charcoal/10 text-brand-charcoal/40'}`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`h-0.5 flex-grow transition-all ${step > s ? 'bg-brand-rose' : 'bg-brand-charcoal/10'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div 
                                    key="step1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-brand-cream/50 backdrop-blur-sm p-10 rounded-sm shadow-sm"
                                >
                                    <h2 className="text-xl font-medium text-brand-charcoal mb-8">Shipping details</h2>
                                    <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-3">First name</label>
                                                <input required name="firstName" value={orderDetails.firstName} onChange={handleInputChange} className="w-full border border-brand-charcoal/10 bg-white p-4 text-sm focus:border-brand-charcoal outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-3">Last name</label>
                                                <input required name="lastName" value={orderDetails.lastName} onChange={handleInputChange} className="w-full border border-brand-charcoal/10 bg-white p-4 text-sm focus:border-brand-charcoal outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-3">Email address</label>
                                            <input required type="email" name="email" value={orderDetails.email} onChange={handleInputChange} className="w-full border border-brand-charcoal/10 bg-white p-4 text-sm focus:border-brand-charcoal outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-3">Street address</label>
                                            <input required name="address" value={orderDetails.address} onChange={handleInputChange} className="w-full border border-brand-charcoal/10 bg-white p-4 text-sm focus:border-brand-charcoal outline-none" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-3">City</label>
                                                <input required name="city" value={orderDetails.city} onChange={handleInputChange} className="w-full border border-brand-charcoal/10 bg-white p-4 text-sm focus:border-brand-charcoal outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-3">State</label>
                                                <input required name="state" value={orderDetails.state} onChange={handleInputChange} className="w-full border border-brand-charcoal/10 bg-white p-4 text-sm focus:border-brand-charcoal outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-3">Zip code</label>
                                                <input required name="zip" value={orderDetails.zip} onChange={handleInputChange} className="w-full border border-brand-charcoal/10 bg-white p-4 text-sm focus:border-brand-charcoal outline-none" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-brand-rose text-brand-charcoal py-7 flex items-center justify-center font-medium text-[18px] hover:bg-white transition-all shadow-sm">
                                            <span>Continue to shipping</span>
                                            <ArrowRight size={20} className="ml-4" />
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div 
                                    key="step2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-brand-cream/50 backdrop-blur-sm p-10 rounded-sm shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-10">
                                        <h2 className="text-xl font-medium text-brand-charcoal">Payment method</h2>
                                        <button onClick={() => setStep(1)} className="text-brand-charcoal opacity-40 p-2 hover:bg-brand-sage rounded-full"><ArrowLeft size={18} /></button>
                                    </div>
                                    <div className="bg-brand-cream p-6 mb-8 text-sm text-brand-charcoal/70 border border-brand-charcoal/10 flex items-center pr-10">
                                        <CreditCard size={20} className="mr-4 flex-shrink-0" />
                                        For this demonstration, payments are simulated. Your information is not stored.
                                    </div>
                                    <div className="space-y-4 mb-10">
                                        <div className="border border-brand-charcoal p-6 flex justify-between items-center bg-brand-charcoal/5">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 rounded-full border-4 border-brand-charcoal mr-4" />
                                                <span className="font-medium text-brand-charcoal">Secure checkout simulation</span>
                                            </div>
                                            <div className="flex space-x-2 grayscale opacity-40">
                                                <div className="w-8 h-4 bg-brand-charcoal rounded-sm" />
                                                <div className="w-8 h-4 bg-blue-900 rounded-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className="w-full bg-brand-rose text-brand-charcoal py-8 font-medium text-[18px] hover:bg-white transition-all shadow-xl"
                                    >
                                    {loading ? 'Processing...' : 'Place order'}
                                    </button>
                                </motion.div>
                            )}

                            {step === 3 && orderResult && (
                                <motion.div 
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-12 rounded-sm shadow-sm text-center"
                                >
                                    <div className="w-20 h-20 bg-brand-sage/20 text-brand-charcoal rounded-full flex items-center justify-center mx-auto mb-8">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h2 className="text-3xl font-medium text-brand-charcoal mb-4">Order confirmed!</h2>
                                    <p className="text-brand-charcoal/60 mb-12">Thank you, {orderDetails.firstName || 'Customer'}. Your order <strong>{orderResult?.id || 'NEW'}</strong> is being processed.</p>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                                        <button className="flex items-center justify-center space-x-2 border border-brand-charcoal/10 p-5 text-[11px] font-medium text-brand-charcoal/60 hover:bg-white">
                                            <FileText size={18} />
                                            <span>Download tax invoice</span>
                                        </button>
                                        <button className="flex items-center justify-center space-x-2 border border-brand-charcoal/10 p-5 text-[11px] font-medium text-brand-charcoal/60 hover:bg-white">
                                            <Truck size={18} />
                                            <span>Print shipping label</span>
                                        </button>
                                    </div>

                                    <Link to="/" className="text-[11px] font-medium text-black border-b border-black pb-2 hover:opacity-70">
                                        Continue shopping
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Summary */}
                    <div className="lg:col-span-4 rounded-sm border border-brand-charcoal/10 bg-brand-cream/30 h-fit overflow-hidden shadow-sm">
                         <div className="p-8 bg-brand-cream/80">
                             <h4 className="font-medium text-brand-charcoal text-lg">Order summary</h4>
                         </div>
                         <div className="p-8 space-y-6">
                            {(Array.isArray(cart) ? cart : []).map(item => (
                                <div key={item.id} className="flex items-start gap-4 text-sm pb-6 border-b border-brand-charcoal/5 last:border-0 last:pb-0">
                                    <div className="w-12 h-16 bg-white rounded-sm overflow-hidden flex-shrink-0 shadow-sm">
                                        <img src={getProductImage(Array.isArray(item.images) ? item.images[0]?.url : item.imageName, media)} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-sm font-medium text-brand-charcoal truncate">{item.name}</h4>
                                        <p className="text-[10px] text-brand-charcoal/40 font-medium">{item.category} • Qty {Number(item.quantity) || 1}</p>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <span className="text-[11px] font-medium text-brand-charcoal">{formatPrice((Number(item.discountPrice) || Number(item.price) || 0) * (Number(item.quantity) || 1))}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-6 border-t border-brand-charcoal/10 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-charcoal/60">Subtotal</span>
                                    <span className="text-brand-charcoal font-medium">{formatPrice(safeSubtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-brand-charcoal/60">Shipping</span>
                                    <span className="text-brand-charcoal font-medium">{safeShipping === 0 ? 'Free' : formatPrice(safeShipping)}</span>
                                </div>
                                {safeDiscount > 0 && (
                                    <div className="flex justify-between text-sm text-brand-charcoal font-medium">
                                        <span>Discount</span>
                                        <span>-{formatPrice(safeDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end pt-6 border-t border-brand-charcoal/20">
                                    <span className="text-sm font-medium text-brand-charcoal">Total</span>
                                    <span className="text-2xl font-medium text-brand-charcoal">{formatPrice(safeTotal)}</span>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
