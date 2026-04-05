import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop, getProductImage } from '../context/ShopContext';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';


const Home = () => {
    console.log("HOME COMPONENT RENDERED");

    const { products, banners, media, loading, formatPrice, settings } = useShop();
    const [currentBanner, setCurrentBanner] = useState(0);
    const [galleryImages, setGalleryImages] = useState([]);
    const heroRef = useRef(null);
    const [heroSize, setHeroSize] = useState({ w: 0, h: 0 });

    console.log("heroRef current:", heroRef?.current);

    // Handle Hero Resizing for Calibration Parity
    useEffect(() => {
        const handleResize = () => {
            if (heroRef.current) {
                setHeroSize({
                    w: heroRef.current.clientWidth,
                    h: heroRef.current.clientHeight
                });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Stable Gallery Content - Picks a consistent set of images from products and media
    useEffect(() => {
        const safeProducts = Array.isArray(products) ? products : [];
        const safeMedia = Array.isArray(media) ? media : [];
        if (safeProducts.length === 0 && safeMedia.length === 0) return;

        const productPool = safeProducts.map(p => p.imageName);
        const mediaPool = safeMedia.map(m => m.name);
        const staticPool = ['IMG_6135', 'IMG_6137', 'IMG_6144', 'IMG_6154', 'IMG_6169', 'IMG_6176', 'IMG_6186', 'IMG_6190', 'IMG_6197', 'IMG_6214'];
        
        const combinedPool = Array.from(new Set([...productPool, ...mediaPool, ...staticPool])).filter(Boolean);
        // NO RANDOM SORT: Content remains static and stable as requested
        const resolvedUrls = combinedPool.map(name => getProductImage(name, safeMedia));
        const uniqueUrls = Array.from(new Set(resolvedUrls));
        
        setGalleryImages(uniqueUrls.slice(0, 12)); 
    }, [products, media]);

    // Static banner for now - no automatic timer
    // Filter and sequence banners based on visibility
    const visibleBanners = useMemo(() => {
        return (banners || []).filter(b => b.isVisible !== false);
    }, [banners]);

    // Banner Auto-Play (7s)
    // Dependencies on currentBanner ensure the timer resets if you manually navigate
    useEffect(() => {
        if (visibleBanners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % visibleBanners.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [visibleBanners, currentBanner]);

    // Ensure current banner index stays in bounds when visibility changes
    useEffect(() => {
        if (currentBanner >= visibleBanners.length && visibleBanners.length > 0) {
            setCurrentBanner(0);
        }
    }, [visibleBanners, currentBanner]);

    // PARITY CHECK: Log actual numeric values on every render/update (STRICT TOP-LEVEL)
    const activeBanner = visibleBanners[currentBanner];
    const containerWidth = heroRef.current?.offsetWidth || 0;
    const containerHeight = heroRef.current?.offsetHeight || 0;
    const refWidth = activeBanner?.refWidth;
    const refHeight = activeBanner?.refHeight;

    // Debug check for data presence
    console.log("BANNER DATA:", activeBanner);

    // Safety Ratio Calculations
    const ratioX = (activeBanner && refWidth) ? containerWidth / refWidth : 1;
    const ratioY = (activeBanner && refHeight) ? containerHeight / refHeight : 1;
    const tx = activeBanner ? (activeBanner.translateX || 0) * ratioX : 0;
    const ty = activeBanner ? (activeBanner.translateY || 0) * ratioY : 0;

    console.log("PARITY CHECK:", {
        containerWidth,
        containerHeight,
        refWidth,
        refHeight,
        ratioX,
        ratioY,
        tx,
        ty
    });

    // Calculate current hero transform values for parity sync
    const heroTransform = useMemo(() => {
        // STRICT: Reference frame must be ready and banner data must exist
        if (containerHeight === 0 || !activeBanner || !refWidth || !refHeight) {
            return `scale(${activeBanner?.zoom || 1})`;
        }
        
        return `translate(${tx}px, ${ty}px) scale(${activeBanner.zoom || 1})`;
    }, [activeBanner, containerWidth, containerHeight, refWidth, refHeight, tx, ty]);

    if (loading) {
        console.log("HOME LOADING...");
        return (
            <div className="min-h-screen flex flex-col items-center justify-center font-medium">
                <div className="w-12 h-12 border-4 border-brand-charcoal/10 border-t-brand-charcoal rounded-full animate-spin mb-6" />
                <div className="text-gray-400 text-sm tracking-wide">Loading</div>
            </div>
        );
    }

    return (
        <div className="pb-20 bg-brand-sage">
            {/* Force Gutter System - Aligns with Header Boundaries */}
            <div className="max-w-7xl mx-auto pt-6 px-4 md:px-0">
                <section className="relative mx-auto md:mx-6 h-auto md:h-[75vh] overflow-hidden group flex flex-col md:flex-row rounded-sm shadow-2xl ring-1 ring-black/5 bg-white">
                <AnimatePresence mode="wait">
                    {activeBanner && (
                        <motion.div
                            key={activeBanner.id || currentBanner}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            className="flex flex-col md:flex-row w-full h-full"
                        >
                            {/* Left Side: Image (65% on Desktop) */}
                            <div 
                                ref={heroRef}
                                className="relative w-full md:w-[65%] h-[50vh] md:h-full overflow-hidden"
                            >
                                <Link 
                                    to={activeBanner.link || "/"}
                                    className="block w-full h-full"
                                >
                                    <img
                                        src={getProductImage(activeBanner.image, media)}
                                        alt={activeBanner.title}
                                        className="w-full h-full block origin-center"
                                        style={{ 
                                            transform: heroTransform,
                                            objectFit: activeBanner.fitMode || 'cover'
                                        }}
                                    />
                                </Link>
                                {/* Refined Natural Image Fade Divider (Editorial Haze) */}
                                <div 
                                    className="absolute top-0 right-0 bottom-0 w-[4%] pointer-events-none z-10"
                                    style={{
                                        background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(124, 132, 108, 0.07) 30%, rgba(124, 132, 108, 0.16) 55%, rgba(124, 132, 108, 0.27) 75%, rgba(124, 132, 108, 0.46) 100%)'
                                    }}
                                />
                            </div>

                            {/* Right Side: Content Panel (35% on Desktop) */}
                            <div className="w-full md:w-[35%] bg-[#7C846C] p-12 md:p-[60px] flex flex-col justify-center min-h-[350px] md:min-h-0">
                                <div className="max-w-[380px] w-full mx-auto md:mx-0 flex flex-col gap-y-7 transition-all duration-700">
                                    <div className="flex flex-col gap-y-5 text-[#1a1a1a]">
                                        <motion.h1
                                            key={`title-${currentBanner}`}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-4xl md:text-5xl font-medium leading-[1.15]"
                                        >
                                            {activeBanner.title}
                                        </motion.h1>
                                        
                                        <motion.p
                                            key={`subtitle-${currentBanner}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-[#5c5c5c] text-lg italic font-medium leading-relaxed"
                                        >
                                            {activeBanner.subtitle}
                                        </motion.p>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                    >
                                        <Link 
                                            to={activeBanner.link || "/"}
                                            className="bg-[#2f2f2f] text-[#EADED0] px-12 py-8 text-[18px] font-medium shadow-lg hover:bg-white hover:text-[#2f2f2f] transition-all uppercase tracking-widest active:scale-95 inline-block text-center mr-auto cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{activeBanner.cta || "Explore collection"}</span>
                                            </div>
                                        </Link>
                                    </motion.div>

                                    {/* Minimal Text Indicator (Instance 1/3 Alignment Edge) */}
                                    <div className="mt-4 flex items-center gap-4 text-[11px] text-[#5c5c5c]/80 uppercase tracking-[0.2em] font-normal">
                                        <span>0{currentBanner + 1}</span>
                                        <div className="w-8 h-px bg-[#1a1a1a]/10" />
                                        <span>0{visibleBanners.length}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-10 right-12 z-50 flex items-center gap-4 bg-black/40 backdrop-blur-3xl px-8 py-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 border border-white/10 shadow-2xl pointer-events-auto">
                    {(Array.isArray(visibleBanners) ? visibleBanners : []).map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentBanner(i); }}
                            className={`h-[4px] rounded-full transition-all duration-500 cursor-pointer ${currentBanner === i ? 'bg-white w-14 shadow-lg' : 'bg-white/30 w-5 hover:bg-white hover:w-8'}`}
                            title={`Switch to slide ${i + 1}`}
                        />
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-2" />
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{currentBanner + 1} / {visibleBanners.length || 1}</span>
                </div>
            </section>
        </div>

            {/* Featured Collections Section (Primary Hierarchy: 5xl, #2f2f2f) */}
            <section className="py-24 bg-brand-sage transition-colors duration-700">
                <div className="max-w-[1280px] mx-auto px-6">
                    <div className="max-w-[720px] mx-auto text-center mb-12">
                        <span className="text-[11px] font-normal text-[#868686] uppercase tracking-widest mb-3 block">Hand-picked essentials</span>
                        <h2 className="text-5xl font-medium text-[#2f2f2f] mb-8 tracking-tight">Featured Collections</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {(Array.isArray(products) ? products : []).map((product) => (
                            <Link 
                                to={`/product/${product.id}`}
                                key={product.id}
                                className="group"
                            >
                                <div className="aspect-[4/5] bg-brand-cream overflow-hidden rounded-sm relative mb-6 shadow-sm hover:shadow-xl transition-all duration-300 ease-out group-hover:scale-[1.01]">
                                    <motion.img
                                        src={getProductImage(Array.isArray(product.images) ? product.images.sort((a,b) => a.sequence - b.sequence)[0]?.url : product.imageName, media)}
                                        alt={product.name}
                                        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ${
                                            (product.id % 3 === 0) ? 'object-[70%_center]' : 
                                            (product.id % 3 === 1) ? 'object-[80%_center]' : 
                                            'object-[75%_center]'
                                        }`}
                                    />
                                    <div className="absolute inset-0 bg-transparent group-hover:bg-[#2f2f2f]/5 transition-colors duration-700" />
                                </div>
                                <div className="text-center md:text-left px-2">
                                    <span className="text-[9px] tracking-widest text-[#868686] font-normal uppercase mb-3 block">{product.category}</span>
                                        <div className="flex flex-col gap-0.5 items-center md:items-start">
                                            <h3 className="text-lg font-medium text-[#2f2f2f] leading-tight group-hover:text-brand-rose transition-colors">{product.name}</h3>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-[15px] text-[#4a4a4a] font-normal">
                                                    {(() => {
                                                        const variants = product.variants || [];
                                                        const allOutOfStock = variants.length > 0 && variants.every(v => (v.stock || 0) <= 0);
                                                        
                                                        if (allOutOfStock) {
                                                            return <span className="text-[10px] font-bold text-brand-rose uppercase tracking-widest bg-brand-rose/5 px-3 py-1 rounded-sm border border-brand-rose/10 animate-pulse">Out of Stock</span>;
                                                        }

                                                        const inStockPrices = variants.filter(v => (v.stock || 0) > 0 && v.price > 0).map(v => v.price);
                                                        const minPrice = inStockPrices.length > 0 ? Math.min(...inStockPrices) : (product.discountPrice || product.price);
                                                        const hasMultiple = new Set(inStockPrices).size > 1;
                                                        
                                                        return (
                                                            <span className="flex items-center gap-1.5 animate-in fade-in duration-500">
                                                                {hasMultiple && <span className="text-[10px] uppercase opacity-40 font-bold tracking-tighter">From</span>}
                                                                {formatPrice(minPrice)}
                                                            </span>
                                                        );
                                                    })()}
                                                </span>
                                                {product.discountPrice && (
                                                    <span className="text-[11px] text-[#868686] line-through">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    <div className="flex items-center justify-center md:justify-start mt-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} fill={i < (Number(product.rating) || 5) ? "#95714F" : "none"} className="text-[#95714F] mr-0.5" />
                                        ))}
                                        <span className="text-[9px] text-[#868686] ml-2 font-normal uppercase tracking-widest">Verified quality</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Community Section (Refined Editorial Grid) */}
            <section className="pt-[72px] pb-[48px] bg-white border-t border-[#eaeaea]">
                <div className="max-w-[1280px] mx-auto px-6">
                    <h2 className="text-4xl font-medium text-[#6f6f6f] mb-4 tracking-tight text-center">Our community</h2>
                    {/* Editorial subtitle for the community gallery - Worn, lived in, loved. */}
                    <p className="text-[#868686] text-xl font-light italic text-center mb-12">
                        Worn, lived in, loved.
                    </p>
                    
                    <div className="flex overflow-x-auto gap-6 no-scrollbar scroll-smooth pb-4 mask-edge-fade snap-x snap-mandatory">
                        {(Array.isArray(galleryImages) ? galleryImages : []).map((img, index) => (
                            <motion.div 
                                key={img}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex-shrink-0 w-[240px] aspect-[4/5] bg-brand-cream overflow-hidden rounded-sm cursor-pointer group shadow-sm transition-all duration-500 hover:scale-[1.02] hover:-translate-y-0.5 snap-start snap-always"
                            >
                                <img src={img} alt={`Lifestyle ${index}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-transparent group-hover:bg-[#2f2f2f]/5 transition-colors duration-700" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-1 flex flex-col gap-1 text-left">
                        <Link to="/moments" className="inline-flex items-center gap-1 text-base font-medium text-[#2f2f2f] hover:text-[#5c5c5c] transition-all group tracking-tight">
                            <span>Visit the gallery</span>
                            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-[2px]" />
                        </Link>
                        <span className="text-[13px] font-normal text-[#868686] leading-none">and share yours</span>
                    </div>
                </div>
            </section>

            {/* Kind Words Tier (Tertiary Hierarchy: 4xl, #6f6f6f) */}
            <section className="pt-16 pb-24 bg-brand-cream/30 overflow-hidden transition-colors duration-700">
                <div className="max-w-[1280px] mx-auto px-6">
                    <div className="max-w-[720px] mx-auto text-center mb-9">
                        <h2 className="text-4xl font-medium text-[#6f6f6f] mb-4 tracking-tight">Kind words</h2>
                        <p className="text-[#868686] text-xl font-light italic">
                            Heartfelt stories from our community of pet parents.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { name: "Sarah & Oliver", text: "The quality of the bandana is unmatched. Oliver looks so dapper and the fabric is incredibly soft.", rating: 5 },
                            { name: "Michael & Luna", text: "Finally, a brand that cares about sustainability as much as style. The packaging was beautiful too!", rating: 5 },
                            { name: "Emma & Cooper", text: "The craftsmanship is beautiful. Cooper's new harness fits perfectly and the aesthetic is simply unmatched.", rating: 5 }
                        ].map((t, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-12 rounded-sm shadow-sm border border-[#eaeaea] hover:shadow-xl transition-shadow duration-700"
                            >
                                <div className="flex mb-5 text-[#95714F]">
                                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                                </div>
                                <p className="text-[#2f2f2f] italic text-lg leading-relaxed mb-11 max-w-[92%] mx-auto">"{t.text}"</p>
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-px bg-[#e6dfd4]" />
                                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#868686]">{t.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



        </div>
    );
};

export default Home;
