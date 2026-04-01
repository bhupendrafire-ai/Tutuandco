
import React, { useState, useEffect } from 'react';
import { Camera, Heart, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop, getProductImage, FINAL_API_URL } from '../context/ShopContext';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';


const Moments = () => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        const loadMoments = async () => {
            try {
                const res = await fetch(`${FINAL_API_URL}/api/moments`);
                const data = await res.json();
                setMoments(data || []);
            } catch (err) {
                console.error("Error loading moments:", err);
            } finally {
                setLoading(false);
            }
        };
        loadMoments();
    }, [FINAL_API_URL]);

    const handleUpload = (e) => {
        e.preventDefault();
        alert("Thank you! Your photo has been submitted for approval.");
        setShowUpload(false);
    };

    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                <header className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
                    <div className="max-w-2xl">
                    <div className="flex flex-col items-center mb-6">
                        <span className="text-[11px] font-medium text-brand-charcoal opacity-40 mb-6 block">Our community</span>
                        <h1 className="text-5xl md:text-7xl font-medium text-brand-charcoal mb-8">Share your moments</h1>
                    </div>
                        <p className="text-brand-charcoal/70 text-xl font-light leading-relaxed">
                            A celebration of life with your furry friends. Tag us @TutuAndCo or upload your favorite shots here.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowUpload(true)}
                        className="bg-brand-rose text-brand-charcoal px-14 py-7 text-[18px] font-medium flex items-center space-x-5 hover:bg-white transition-all shadow-xl"
                    >
                        <Heart size={20} />
                        <span>Share a photo</span>
                    </button>
                </header>

                <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
                    {moments.map((moment, i) => (
                        <motion.div 
                            key={moment.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="relative group rounded-sm overflow-hidden bg-brand-cream break-inside-avoid shadow-sm hover:shadow-2xl transition-all duration-500"
                        >
                            <img 
                                src={getProductImage(moment.imageUrl)} 
                                alt={moment.petName} 
                                className="w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 text-white">
                                <div className="flex justify-between items-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="flex flex-col">
                                        <p className="font-medium text-xl">{moment.petName}</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] opacity-40 font-medium tracking-wide">Family photo</span>
                                        </div>
                                    </div>
                                    <button className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white hover:text-red-500 transition-all">
                                        <Heart size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {showUpload && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                onClick={() => setShowUpload(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative bg-brand-cream p-12 rounded-sm max-w-lg w-full shadow-2xl"
                            >
                                <h2 className="text-3xl font-medium text-brand-charcoal mb-8">Share a photo</h2>
                                <form onSubmit={handleUpload} className="space-y-6">
                                    <div className="aspect-video bg-brand-sage/20 border-2 border-dashed border-brand-charcoal/10 flex flex-col items-center justify-center text-brand-charcoal/60 cursor-pointer hover:border-brand-charcoal transition-colors rounded-sm">
                                        <Plus size={32} className="mb-2" />
                                        <span className="text-[11px] font-medium">Select image</span>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-2">Pet's name</label>
                                            <input name="petName" required className="w-full bg-white border border-brand-charcoal/10 p-4 text-sm focus:border-brand-charcoal outline-none" placeholder="e.g. Tutu" />
                                        </div>
                                        <button type="submit" className="w-full bg-brand-rose text-brand-charcoal py-7 font-medium text-[18px] hover:bg-white transition-all shadow-sm">Submit for approval</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Moments;
