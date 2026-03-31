
import React, { useState, useEffect } from 'react';
import { Camera, Heart, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mockApi from '../api/mockApi';
import { getProductImage } from '../context/ShopContext';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';


const Moments = () => {
    const [moments, setMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        mockApi.getMoments().then(data => {
            setMoments(data);
            setLoading(false);
        });
    }, []);

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
                        <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-brand-charcoal opacity-60 mb-6 block">Our Community</span>
                        <h1 className="text-5xl md:text-7xl font-serif text-brand-charcoal mb-8">Share Your Moments</h1>
                        <p className="text-brand-charcoal/70 text-xl font-light leading-relaxed">
                            A celebration of life with your furry friends. Tag us @TutuAndCo or upload your favorite shots here.
                        </p>
                    </div>
                    <button 
                        onClick={() => setShowUpload(true)}
                        className="bg-brand-charcoal text-white px-10 py-5 text-[10px] font-bold uppercase tracking-widest flex items-center space-x-3 hover:bg-brand-charcoal/80 transition-all shadow-xl"
                    >
                        <Camera size={16} />
                        <span>Upload Photo</span>
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
                                        <p className="font-serif text-xl">{moment.petName}</p>
                                        <div className="flex items-center mt-1">
                                            <img src={logoWhite} alt="Tutu & Co" className="h-4 w-auto mr-2" />
                                            <span className="text-[10px] uppercase tracking-widest opacity-80">Family</span>
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
                                <h2 className="text-3xl font-serif text-brand-charcoal mb-8">Share a Photo</h2>
                                <form onSubmit={handleUpload} className="space-y-6">
                                    <div className="aspect-video bg-brand-sage/20 border-2 border-dashed border-brand-charcoal/10 flex flex-col items-center justify-center text-brand-charcoal/60 cursor-pointer hover:border-brand-charcoal transition-colors rounded-sm">
                                        <Plus size={32} className="mb-2" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Select Image</span>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold text-brand-charcoal/60 tracking-widest mb-2">Pet's Name</label>
                                        <input required className="w-full border border-brand-charcoal/10 p-4 text-sm focus:border-brand-charcoal outline-none bg-brand-sage/5" placeholder="e.g. Luna" />
                                    </div>
                                    <button type="submit" className="w-full bg-brand-charcoal text-white py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-brand-charcoal/80">Submit for Approval</button>
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
