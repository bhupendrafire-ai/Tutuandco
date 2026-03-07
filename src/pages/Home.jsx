import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const banners = [
    {
        id: 1,
        title: "Organic & Premium Comfort",
        subtitle: "Eco-friendly apparel for your best friends.",
        cta: "Shop the Collection",
        image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop", // Golden Retriever in sweater
        color: "bg-[#8C916C]"
    },
    {
        id: 2,
        title: "MVP: The Signature Harness",
        subtitle: "Durable, stylish, and pet-approved.",
        cta: "View MVP Items",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1964&auto=format&fit=crop", // Dog in stylish harness
        color: "bg-[#95714F]"
    },
    {
        id: 3,
        title: "New Arrivals: Sage Collection",
        subtitle: "Minimalist designs in our favorite hues.",
        cta: "Expose Style",
        image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop", // Cat in cozy setting
        color: "bg-[#ACB087]"
    }
];

const products = [
    { id: 1, name: "Organic Cotton Tee", price: "$32.00", rating: 5, image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop" },
    { id: 2, name: "Linen Pet Bandana", price: "$18.00", rating: 4, image: "https://images.unsplash.com/photo-1591768793355-74d7af236c17?q=80&w=2070&auto=format&fit=crop" },
    { id: 3, name: "Luxury Pet Bed", price: "$120.00", rating: 5, image: "https://images.unsplash.com/photo-1541599540903-216a46ca1dfc?q=80&w=2070&auto=format&fit=crop" },
    { id: 4, name: "Handcrafted Leash", price: "$45.00", rating: 5, image: "https://images.unsplash.com/photo-1601758124277-f00d6d03d16c?q=80&w=2070&auto=format&fit=crop" },
];

const Home = () => {
    const [currentBanner, setCurrentBanner] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="pb-20">
            {/* Revolving Banner */}
            <section className="relative h-[80vh] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentBanner}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={banners[currentBanner].image}
                            alt={banners[currentBanner].title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-center p-6">
                            <div className="max-w-2xl text-white">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-5xl md:text-7xl font-serif mb-6"
                                >
                                    {banners[currentBanner].title}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg md:text-xl mb-8 font-light"
                                >
                                    {banners[currentBanner].subtitle}
                                </motion.p>
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-white text-black px-10 py-4 rounded-sm tracking-widest text-sm uppercase font-medium hover:bg-[#EADED0] transition-colors"
                                >
                                    {banners[currentBanner].cta}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Banner Navigation Dots */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3">
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentBanner(i)}
                            className={`w-2 h-2 rounded-full transition-all ${currentBanner === i ? 'bg-white w-8' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            </section>

            {/* Featured Products Grid */}
            <section className="max-w-7xl mx-auto px-6 mt-24">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-serif text-black mb-2">New Arrivals</h2>
                        <p className="text-[#95714F]/60">Ethically made pet essentials.</p>
                    </div>
                    <button className="text-[#95714F] font-medium border-b border-[#95714F] pb-1 hover:opacity-70 transition-opacity">View All</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            whileHover={{ y: -5 }}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-[4/5] bg-[#EADED0] overflow-hidden rounded-sm relative mb-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <button className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm text-black py-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Add to Cart
                                </button>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-[#95714F] font-medium transition-colors group-hover:text-black">{product.name}</h3>
                                    <div className="flex items-center mt-1">
                                        {[...Array(product.rating)].map((_, i) => (
                                            <Star key={i} size={12} fill="#95714F" className="text-[#95714F] mr-0.5" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[#95714F] font-medium">{product.price}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Brand Ethos */}
            <section className="bg-[#EADED0] mt-32 py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-[#8C916C]">Our Philosophy</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-black mt-6 mb-8">Naturally Sourced. Designed for Movement.</h2>
                    <p className="text-[#95714F] leading-relaxed text-lg italic">
                        "At Tutu & Co, we believe our pet companions deserve the same quality of organic materials and thoughtful design as we do."
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home;
