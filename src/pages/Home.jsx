import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop, getProductImage } from '../context/ShopContext';

const Home = () => {
    const { products, banners, media, loading } = useShop();
    const [currentBanner, setCurrentBanner] = useState(0);
    const [galleryImages, setGalleryImages] = useState([]);

    // Shuffling Logic for Gallery - Strictly 10 unique images
    useEffect(() => {
        const shuffleGallery = () => {
            if (!products.length) return;

            const productPool = products.map(p => p.imageName);
            const mediaPool = media.map(m => m.name);
            const staticPool = ['IMG_6135', 'IMG_6137', 'IMG_6144', 'IMG_6154', 'IMG_6169', 'IMG_6176', 'IMG_6186', 'IMG_6190', 'IMG_6197', 'IMG_6214'];
            
            const combinedPool = Array.from(new Set([...productPool, ...mediaPool, ...staticPool])).filter(Boolean);
            const shuffled = combinedPool.sort(() => 0.5 - Math.random());
            const resolvedUrls = shuffled.map(name => getProductImage(name, media));
            
            // Deduplicate resolved URLs (handles same fallback for multiple names)
            const uniqueUrls = Array.from(new Set(resolvedUrls));
            let finalSelection = uniqueUrls.slice(0, 10);
            
            // Backfill if needed
            if (finalSelection.length < 10) {
                const backfill = staticPool
                    .map(name => getProductImage(name, media))
                    .filter(url => !finalSelection.includes(url));
                finalSelection = [...finalSelection, ...backfill].slice(0, 10);
            }

            setGalleryImages(finalSelection);
        };
        
        shuffleGallery();
        const interval = setInterval(shuffleGallery, 15000); 
        return () => clearInterval(interval);
    }, [products, media]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (banners.length) {
                setCurrentBanner((prev) => (prev + 1) % banners.length);
            }
        }, 8000);
        return () => clearInterval(timer);
    }, [banners]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-serif">Loading Tutu & Co...</div>;

    return (
        <div className="pb-20 bg-white">
            {/* Revolving Banner */}
            <section className="relative h-[85vh] overflow-hidden">
                <AnimatePresence mode="wait">
                    {banners[currentBanner] && (
                        <motion.div
                            key={currentBanner}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            className="absolute inset-0"
                        >
                            <img
                                src={getProductImage(banners[currentBanner].image, media)}
                                alt={banners[currentBanner].title}
                                className="w-full h-full object-cover scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-6">
                                <div className="max-w-3xl text-white">
                                    <motion.span 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block"
                                    >
                                        Tutu & Co Essentials
                                    </motion.span>
                                    <motion.h1
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-6xl md:text-8xl font-serif mb-8 drop-shadow-2xl leading-tight"
                                    >
                                        {banners[currentBanner].title}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-xl md:text-2xl mb-12 font-light drop-shadow-lg max-w-xl mx-auto opacity-90"
                                    >
                                        {banners[currentBanner].subtitle}
                                    </motion.p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-white text-black px-12 py-5 rounded-sm tracking-[0.2em] text-xs uppercase font-bold hover:bg-[#EADED0] transition-all shadow-2xl"
                                    >
                                        {banners[currentBanner].cta}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Banner Navigation Dots */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-4">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentBanner(i)}
                            className={`h-1 rounded-full transition-all duration-500 ${currentBanner === i ? 'bg-white w-12' : 'bg-white/30 w-6'}`}
                        />
                    ))}
                </div>
            </section>

            {/* Featured Products Grid */}
            <section className="max-w-7xl mx-auto px-6 mt-32">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-[#8C916C]">The Seasonal Edit</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-black mt-4">Curated Essentials</h2>
                    </div>
                    <Link to="/" className="text-[#95714F] font-bold tracking-widest text-[10px] uppercase border-b-2 border-[#95714F] pb-2 hover:opacity-70 transition-all flex items-center group">
                        Browse All Collections
                        <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {products?.map((product) => (
                        <Link 
                            to={`/product/${product.id}`}
                            key={product.id}
                            className="group"
                        >
                            <div className="aspect-[4/5] bg-[#F8F4F0] overflow-hidden rounded-sm relative mb-6 shadow-sm hover:shadow-xl transition-shadow duration-500">
                                <motion.img
                                    src={getProductImage(product.imageName)}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                    <button className="w-full bg-white/95 backdrop-blur-sm text-black py-4 text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg">
                                        View Details
                                    </button>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-[#8C916C] font-bold mb-2 block">{product.category}</span>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-serif text-black">{product.name}</h3>
                                    <p className="text-[#95714F] font-bold">${product.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center mt-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < product.rating ? "#95714F" : "none"} className="text-[#95714F] mr-1" />
                                    ))}
                                    <span className="text-[10px] text-[#95714F]/60 ml-2 font-medium">Top Rated</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Shuffling Uneven Grid Gallery */}
            <section className="max-w-7xl mx-auto px-6 mt-48">
                <div className="text-center mb-24">
                    <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#8C916C] block mb-6">Our Community</span>
                    <h2 className="text-5xl md:text-6xl font-serif text-black">The Tutu & Co Lifestyle</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 auto-rows-[250px] gap-6">
                    <AnimatePresence mode="popLayout">
                        {galleryImages.map((img, index) => (
                            <motion.div 
                                layout
                                key={img}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 100, 
                                    damping: 20,
                                    opacity: { duration: 0.5 }
                                }}
                                className={`
                                    relative bg-[#F4F1EA] overflow-hidden rounded-sm cursor-pointer group shadow-md
                                    ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                                    ${index === 4 ? 'md:row-span-2' : ''}
                                    ${index === 5 ? 'md:col-span-2' : ''}
                                    ${index === 9 ? 'md:col-span-2' : ''}
                                `}
                            >
                                <img 
                                    src={img} 
                                    alt={`Lifestyle ${index}`} 
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <span className="text-white text-[10px] uppercase tracking-[0.3em] font-bold border border-white/40 px-6 py-3 backdrop-blur-sm bg-black/10">Shop Look</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-32 bg-[#EADED0]/30 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <header className="text-center mb-20">
                        <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#8C916C] mb-6 block">Kind Words</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-black">The Community Voice</h2>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { name: "Sarah & Oliver", text: "The quality of the bandana is unmatched. Oliver looks so dapper and the fabric is incredibly soft.", rating: 5 },
                            { name: "Michael & Luna", text: "Finally, a brand that cares about sustainability as much as style. The packaging was beautiful too!", rating: 5 },
                            { name: "Emma & Cooper", text: "The sizing guide was perfect. Cooper's new harness fits like a glove. Highly recommend!", rating: 5 }
                        ].map((t, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-12 rounded-sm shadow-sm border border-[#C7AF94]/10"
                            >
                                <div className="flex mb-8 text-[#95714F]">
                                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-black italic font-serif text-lg leading-relaxed mb-10">"{t.text}"</p>
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-px bg-[#C7AF94]" />
                                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#95714F]">{t.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Moments Teaser */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#8C916C] mb-6 block">Stay Connected</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-black mb-10">#TutuAndCo Family</h2>
                    <p className="text-[#95714F] mb-16 text-xl font-light">Capture the joy. Share your moments with us.</p>
                    <Link 
                        to="/moments"
                        className="inline-flex items-center space-x-4 bg-black text-white px-12 py-6 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#95714F] transition-all shadow-xl"
                    >
                        <span>Visit the Gallery</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Brand Ethos */}
            <section className="bg-[#F8F4F0] mt-48 py-32 px-6 text-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#8C916C]">Our Philosophy</span>
                    <h2 className="text-5xl md:text-7xl font-serif text-black mt-8 mb-12 leading-tight">Naturally Sourced.<br/>Designed for Movement.</h2>
                    <p className="text-[#95714F] leading-relaxed text-2xl italic font-serif opacity-80 max-w-2xl mx-auto">
                        "At Tutu & Co, we believe our pet companions deserve the same quality of organic materials and thoughtful design as we do."
                    </p>
                    <div className="mt-16 flex flex-col items-center">
                        <div className="w-px h-24 bg-[#C7AF94] mb-8" />
                        <Link to="/" className="text-[10px] uppercase tracking-[0.3em] font-bold text-black hover:opacity-70 transition-opacity">Discover Our Story</Link>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#EADED0] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8C916C] rounded-full translate-x-1/3 translate-y-1/3 opacity-10" />
            </section>
        </div>
    );
};

export default Home;
