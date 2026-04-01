import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop, getProductImage } from '../context/ShopContext';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';


const Home = () => {
    const { products, banners, media, loading, formatPrice, settings } = useShop();
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

    // Static banner for now - no automatic timer
    useEffect(() => {
        // Keeping setCurrentBanner(0) to ensure we start at the first banner
        setCurrentBanner(0);
    }, [banners]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center font-medium">
            <div className="w-12 h-12 border-4 border-brand-charcoal/10 border-t-brand-charcoal rounded-full animate-spin mb-6" />
            <div className="text-gray-400 text-sm tracking-wide">Loading</div>
        </div>
    );


    return (
        <div className="pb-20 bg-brand-sage">
            {/* Static Hero Banner with Group Hover */}
            <section className="relative h-[75vh] overflow-hidden group">
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
                                className="w-full h-full object-cover object-[center_20%] transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/30 to-transparent flex items-center justify-end text-right p-12 md:p-32">
                                <div className="max-w-xl text-white flex flex-col items-end backdrop-blur-[2px] p-8 rounded-sm">
                                    <motion.h1
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className="text-4xl md:text-5xl font-medium mb-12 drop-shadow-xl leading-tight text-white/90"
                                    >
                                        {banners[currentBanner].title}
                                    </motion.h1>
                                    
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                    >
                                        <Link 
                                            to={banners[currentBanner].link || "/"}
                                            className="bg-[#4A5D4E] text-[#EADED0] px-16 py-8 text-[18px] font-medium hover:bg-white hover:text-brand-charcoal transition-all shadow-2xl"
                                        >
                                            {banners[currentBanner].cta || "Shop collection"}
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute bottom-4 right-12 flex space-x-2 bg-black/10 backdrop-blur-md px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentBanner(i); }}
                            className={`h-[2px] rounded-full transition-all duration-500 ${currentBanner === i ? 'bg-white w-8' : 'bg-white/20 w-4 hover:bg-white/40'}`}
                        />
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 mt-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-8">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-medium text-brand-charcoal mb-4">Featured Collections</h2>
                        <p className="text-brand-charcoal/40 text-lg">Hand-picked essentials for the modern pet.</p>
                    </div>
                    <Link to="/" className="text-sm font-medium border-b border-brand-charcoal pb-1 hover:opacity-60 transition-opacity">
                        View all items
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {products?.map((product) => (
                        <Link 
                            to={`/product/${product.id}`}
                            key={product.id}
                            className="group"
                        >
                            <div className="aspect-[4/5] bg-brand-cream overflow-hidden rounded-sm relative mb-6 shadow-sm hover:shadow-xl transition-shadow duration-500">
                                <motion.img
                                    src={getProductImage(product.images?.sort((a,b) => a.sequence - b.sequence)[0]?.url || product.imageName)}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                            </div>
                            <div>
                                <span className="text-[10px] tracking-wider text-[#8C916C] font-medium mb-3 block">{product.category}</span>
                                <div className="flex flex-col items-start gap-1">
                                    <h3 className="text-xl font-medium text-brand-charcoal leading-tight">{product.name}</h3>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-brand-charcoal font-medium">
                                            {formatPrice(product.discountPrice || product.price)}
                                        </span>
                                        {product.discountPrice && (
                                            <span className="text-[10px] opacity-30 line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center mt-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={11} fill={i < product.rating ? "#95714F" : "none"} className="text-[#95714F] mr-1" />
                                    ))}
                                    <span className="text-[10px] text-[#95714F]/60 ml-2 font-medium tracking-wider">Top rated</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 mt-20">
                <div className="flex flex-col items-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-medium text-brand-charcoal text-center tracking-tight">Our community</h2>
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
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                className={`relative bg-brand-cream overflow-hidden rounded-sm cursor-pointer group shadow-md ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} ${index === 4 ? 'md:row-span-2' : ''} ${index === 5 ? 'md:col-span-2' : ''} ${index === 9 ? 'md:col-span-2' : ''}`}
                            >
                                <img src={img} alt={`Lifestyle ${index}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            <section className="py-20 bg-brand-cream/30 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl md:text-6xl font-medium text-brand-charcoal mb-6">Kind words</h2>
                        <div className="w-12 h-1 bg-brand-rose mx-auto opacity-30" />
                    </div>
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
                                className="bg-white p-12 rounded-sm shadow-sm border border-[#C7AF94]/10"
                            >
                                <div className="flex mb-8 text-[#95714F]">
                                    {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-brand-charcoal italic text-lg leading-relaxed mb-10">"{t.text}"</p>
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 h-px bg-brand-charcoal/20" />
                                    <p className="text-[10px] font-medium tracking-[0.3em] text-brand-charcoal/60">{t.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
                    <span className="tracking-[0.3em] text-[10px] font-medium text-[#8C916C] mb-6 block">Stay connected</span>
                    <div className="flex flex-col items-center mb-10">
                        <img src={logo} alt="Tutu & Co" className="h-16 w-auto mb-2" />
                    </div>
                    <p className="text-[#95714F] mb-10 text-xl font-light">Capture the joy. Share your moments with us.</p>
                    <Link 
                        to="/moments"
                        className="inline-flex items-center space-x-6 bg-brand-rose text-brand-charcoal px-16 py-10 text-[18px] font-medium hover:bg-white transition-all shadow-lg"
                    >
                        <span>Visit the gallery</span>
                        <ArrowRight size={24} />
                    </Link>
                </div>
            </section>

            <section className="bg-brand-cream mt-20 py-20 px-6 text-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    <span className="text-[11px] font-medium text-brand-charcoal opacity-60">Our philosophy</span>
                    <h2 className="text-5xl md:text-7xl font-medium text-brand-charcoal mt-8 mb-10 leading-tight">Naturally Sourced.<br/>Designed for Movement.</h2>
                    <p className="text-brand-charcoal/80 leading-relaxed text-2xl italic opacity-80 max-w-2xl mx-auto">
                        "At Tutu & Co, we believe our pet companions deserve the same quality of organic materials and thoughtful design as we do."
                    </p>
                    <div className="mt-16 flex flex-col items-center">
                        <div className="w-px h-24 bg-brand-charcoal/20 mb-8" />
                        <Link to="/" className="text-[10px] tracking-[0.3em] font-medium text-brand-charcoal hover:opacity-70 transition-opacity">Discover our story</Link>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-brand-cream/50 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-sage/50 rounded-full translate-x-1/3 translate-y-1/3 opacity-10" />
            </section>
        </div>
    );
};

export default Home;
