import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop, getProductImage } from '../context/ShopContext';
import logo from '../assets/logo.png';

const Home = () => {
    const { products, banners, media, loading, formatPrice } = useShop();
    const [currentBanner, setCurrentBanner] = useState(0);
    const [galleryImages, setGalleryImages] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Shuffling Logic for Gallery - Strictly 10 unique images
    useEffect(() => {
        const shuffleGallery = () => {
            const safeProducts = Array.isArray(products) ? products : [];
            const safeMedia = Array.isArray(media) ? media : [];
            if (safeProducts.length === 0 && safeMedia.length === 0) return;

            const productPool = safeProducts.map(p => p.imageName);
            const mediaPool = safeMedia.map(m => m.name);
            const staticPool = ['IMG_6135', 'IMG_6137', 'IMG_6144', 'IMG_6154', 'IMG_6169', 'IMG_6176', 'IMG_6186', 'IMG_6190', 'IMG_6197', 'IMG_6214'];
            
            const combinedPool = Array.from(new Set([...productPool, ...mediaPool, ...staticPool])).filter(Boolean);
            const shuffled = combinedPool.sort(() => 0.5 - Math.random());
            const resolvedUrls = shuffled.map(name => getProductImage(name, safeMedia));
            
            const uniqueUrls = Array.from(new Set(resolvedUrls));
            let finalSelection = uniqueUrls.slice(0, 10);
            
            if (finalSelection.length < 10) {
                const backfill = staticPool
                    .map(name => getProductImage(name, safeMedia))
                    .filter(url => !finalSelection.includes(url));
                finalSelection = [...finalSelection, ...backfill].slice(0, 10);
            }

            setGalleryImages(finalSelection);
        };
        
        shuffleGallery();
        const interval = setInterval(shuffleGallery, 15000); 
        return () => clearInterval(interval);
    }, [products, media]);

    const visibleBanners = useMemo(() => {
        return (banners || []).filter(b => b.isVisible !== false);
    }, [banners]);

    useEffect(() => {
        if (visibleBanners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % visibleBanners.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [visibleBanners, currentBanner]);

    const activeBanner = visibleBanners[currentBanner];
    const isMobile = windowWidth < 768;

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center font-medium">
                <div className="w-12 h-12 border-4 border-brand-charcoal/10 border-t-brand-charcoal rounded-full animate-spin mb-6" />
                <div className="text-gray-400 text-sm tracking-wide">Loading</div>
            </div>
        );
    }

    return (
        <div className="bg-brand-sage overflow-x-hidden">
            {/* HERO SECTION - Centered & Stacked */}
            <section className="page-container section-narrative">
                <AnimatePresence mode="wait">
                    {activeBanner && (
                        <div key={activeBanner.id || currentBanner} className="flex flex-col items-center">
                            {/* Narrative Block */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8 }}
                                className="text-tight mb-16"
                            >
                                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-charcoal opacity-40 mb-6 block">Premium Collection</span>
                                <h1 className="text-5xl md:text-8xl font-medium text-brand-charcoal leading-[1.1] tracking-tight mb-8">
                                    {activeBanner.title}
                                </h1>
                                <p className="text-xl md:text-2xl text-brand-charcoal/60 italic font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                                    "{activeBanner.subtitle}"
                                </p>
                                <Link 
                                    to={activeBanner.link || "/"}
                                    className="bg-brand-charcoal text-[#EADED0] px-16 py-6 text-[14px] font-bold shadow-2xl hover:bg-white hover:text-brand-charcoal transition-all uppercase tracking-[0.3em] inline-block"
                                >
                                    {activeBanner.cta || "Explore collection"}
                                </Link>
                            </motion.div>

                            {/* Art-Directed Image Block */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="content-wrap"
                            >
                                <div className={`relative overflow-hidden rounded-sm shadow-2xl ${isMobile ? 'aspect-[4/5]' : 'aspect-[21/9]'}`}>
                                    <img
                                        src={getProductImage(isMobile && activeBanner.mobileImage ? activeBanner.mobileImage : activeBanner.image, media)}
                                        alt={activeBanner.title}
                                        className="w-full h-full object-cover origin-center"
                                        style={{ 
                                            transform: !isMobile ? `translate(${activeBanner.translateX || 0}px, ${activeBanner.translateY || 0}px) scale(${activeBanner.zoom || 1})` : 'scale(1)',
                                        }}
                                    />
                                    {/* Subtle Ambient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5" />
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </section>

            {/* FEATURED COLLECTIONS - Consistent Grid */}
            <section className="bg-white/50 section-dense w-full">
                <div className="page-container mb-16">
                    <div className="text-tight">
                        <h2 className="text-4xl md:text-6xl font-medium text-brand-charcoal tracking-tight mb-6">Featured Collections</h2>
                        <div className="w-12 h-px bg-brand-charcoal/20 mx-auto mb-6" />
                        <p className="text-brand-charcoal/50 text-lg md:text-xl font-medium">Curated essentials for the mindful companion.</p>
                    </div>
                </div>

                <div className="page-container mb-16">
                    <div className="content-wrap">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {(Array.isArray(products) ? products : []).map((product) => (
                                <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col items-center">
                                    <div className="w-full aspect-[4/5] bg-brand-cream overflow-hidden rounded-sm relative mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                                        <motion.img
                                            src={getProductImage(Array.isArray(product.images) ? product.images.sort((a,b) => a.sequence - b.sequence)[0]?.url : product.imageName, media)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                    </div>
                                    <div className="text-center w-full">
                                        <span className="text-[9px] tracking-[0.3em] text-[#8C916C] font-bold mb-4 block uppercase">{product.category}</span>
                                        <h3 className="text-xl font-medium text-brand-charcoal leading-tight mb-2 px-4">{product.name}</h3>
                                        <div className="flex items-center justify-center space-x-3 mb-4">
                                            <span className="text-sm text-brand-charcoal/80 font-bold tracking-wider">
                                                {formatPrice(product.discountPrice || product.price)}
                                            </span>
                                            {product.discountPrice && (
                                                <span className="text-[10px] opacity-30 line-through font-bold">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < (Number(product.rating) || 5) ? "#2f2f2f" : "none"} className="text-brand-charcoal mr-1 opacity-40" />
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/" className="text-[10px] font-bold border-b-2 border-brand-charcoal pb-2 hover:opacity-60 transition-all uppercase tracking-[0.3em]">
                        View all items
                    </Link>
                </div>
            </section>

            {/* COMMUNITY GALLERY - Structured Grid */}
            <section className="page-container section-dense">
                <div className="text-tight mb-16">
                    <h2 className="text-4xl md:text-6xl font-medium text-brand-charcoal tracking-tight mb-4">Our community</h2>
                    <span className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-[0.4em]">Life in Tutu & Co</span>
                </div>
                
                <div className="content-wrap">
                    <div className="grid grid-cols-2 md:grid-cols-5 auto-rows-[250px] md:auto-rows-[300px] gap-8">
                        <AnimatePresence mode="popLayout">
                            {(Array.isArray(galleryImages) ? galleryImages : []).map((img, index) => (
                                <motion.div 
                                    layout
                                    key={img}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    className={`relative bg-brand-cream overflow-hidden rounded-sm group shadow-sm ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} ${index === 4 ? 'md:row-span-2' : ''} ${index === 5 ? 'md:col-span-2' : ''} ${index === 9 ? 'md:col-span-2' : ''}`}
                                >
                                    <img src={img} alt={`Lifestyle ${index}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS - Calm Balanced Rhythm */}
            <section className="bg-white/30 section-narrative">
                <div className="page-container">
                    <div className="text-tight mb-20 text-center">
                        <h2 className="text-4xl md:text-6xl font-medium text-brand-charcoal mb-8">Kind words</h2>
                        <div className="w-16 h-1 bg-brand-rose mx-auto opacity-40 rounded-full" />
                    </div>
                    
                    <div className="content-wrap">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            {[
                                { name: "Sarah & Oliver", text: "The quality of the bandana is unmatched. Oliver looks so dapper and the fabric is incredibly soft.", rating: 5 },
                                { name: "Michael & Luna", text: "Finally, a brand that cares about sustainability as much as style. The packaging was beautiful too!", rating: 5 },
                                { name: "Emma & Cooper", text: "The sizing guide was perfect. Cooper's new harness fits like a glove. Highly recommend!", rating: 5 }
                            ].map((t, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-16 rounded-sm shadow-2xl border border-brand-charcoal/5 flex flex-col items-center text-center"
                                >
                                    <div className="flex mb-10 text-brand-charcoal opacity-30">
                                        {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="text-brand-charcoal italic text-xl leading-relaxed mb-12">"{t.text}"</p>
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="w-12 h-px bg-brand-charcoal/10" />
                                        <p className="text-[9px] font-bold tracking-[0.4em] text-brand-charcoal/40 uppercase">{t.name}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* PHILOSOPHY - Pure Storytelling */}
            <section className="section-narrative bg-brand-cream relative overflow-hidden">
                <div className="page-container relative z-10">
                    <div className="text-tight">
                        <span className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-[0.4em] mb-12 block">Our philosophy</span>
                        <h2 className="text-5xl md:text-8xl font-medium text-brand-charcoal mb-12 leading-[1.1] tracking-tight">Naturally Sourced.<br/>Designed for Movement.</h2>
                        <p className="text-brand-charcoal/70 leading-relaxed text-2xl md:text-3xl italic opacity-80 mb-16 font-medium">
                            "At Tutu & Co, we believe our pet companions deserve the same quality of organic materials and thoughtful design as we do."
                        </p>
                        <div className="flex flex-col items-center">
                            <div className="w-px h-24 bg-brand-charcoal/20 mb-8" />
                            <Link to="/" className="text-[10px] tracking-[0.4em] font-bold text-brand-charcoal hover:opacity-60 transition-all uppercase border-b-2 border-brand-charcoal pb-2">Discover our story</Link>
                        </div>
                    </div>
                </div>
                {/* Dynamic Architectural Accents */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-40" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-brand-sage/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-20" />
            </section>

            {/* STAY CONNECTED - Final Signature */}
            <section className="section-narrative bg-white">
                <div className="page-container text-center flex flex-col items-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mb-16"
                    >
                        <img src={logo} alt="Tutu & Co" className="h-20 w-auto grayscale" />
                    </motion.div>
                    <p className="text-brand-charcoal/40 mb-16 text-2xl font-light italic tracking-tight">Capture the joy. Share your moments with us.</p>
                    <Link 
                        to="/moments"
                        className="group inline-flex items-center space-x-8 bg-brand-charcoal text-[#EADED0] px-20 py-8 text-[16px] font-bold hover:bg-brand-rose hover:text-brand-charcoal transition-all shadow-2xl uppercase tracking-[0.3em]"
                    >
                        <span>Visit the gallery</span>
                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
