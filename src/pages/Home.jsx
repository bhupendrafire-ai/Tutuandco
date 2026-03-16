import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ExternalLink } from 'lucide-react';

// Import HeroShots images
import hero1 from '../assets/heroshots/IMG_6135.jpg';
import hero2 from '../assets/heroshots/IMG_6137.jpg';
import hero3 from '../assets/heroshots/IMG_6144.jpg';

import prod1 from '../assets/heroshots/IMG_6154.jpg';
import prod2 from '../assets/heroshots/IMG_6169.jpg';
import prod3 from '../assets/heroshots/IMG_6176.jpg';
import prod4 from '../assets/heroshots/IMG_6186.jpg';

import gall1 from '../assets/heroshots/IMG_6190.jpg';
import gall2 from '../assets/heroshots/IMG_6197.jpg';
import gall3 from '../assets/heroshots/IMG_6201.jpg';
import gall4 from '../assets/heroshots/IMG_6203.jpg';
import gall5 from '../assets/heroshots/IMG_6214.jpg';
import gall6 from '../assets/heroshots/IMG_6219.jpg';

const banners = [
    {
        id: 1,
        title: "Organic & Premium Comfort",
        subtitle: "Eco-friendly apparel for your best friends.",
        cta: "Shop the Collection",
        image: hero1,
        color: "bg-[#8C916C]"
    },
    {
        id: 2,
        title: "MVP: The Signature Harness",
        subtitle: "Durable, stylish, and pet-approved.",
        cta: "View MVP Items",
        image: hero2,
        color: "bg-[#95714F]"
    },
    {
        id: 3,
        title: "New Arrivals: Sage Collection",
        subtitle: "Minimalist designs in our favorite hues.",
        cta: "Expose Style",
        image: hero3,
        color: "bg-[#ACB087]"
    }
];

const products = [
    { id: 1, name: "Premium Utility Harness", price: "$48.00", rating: 5, image: prod1 },
    { id: 2, name: "Classic Cotton Tee", price: "$32.00", rating: 4, image: prod2 },
    { id: 3, name: "Adventure Lead", price: "$35.00", rating: 5, image: prod3 },
    { id: 4, name: "Comfort Knit Sweater", price: "$52.00", rating: 5, image: prod4 },
];

const gallery = [gall1, gall2, gall3, gall4, gall5, gall6];

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
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center p-6">
                            <div className="max-w-2xl text-white">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-5xl md:text-7xl font-serif mb-6 drop-shadow-lg"
                                >
                                    {banners[currentBanner].title}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg md:text-xl mb-8 font-light drop-shadow-md"
                                >
                                    {banners[currentBanner].subtitle}
                                </motion.p>
                                <motion.button
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-white text-black px-10 py-4 rounded-sm tracking-widest text-sm uppercase font-medium hover:bg-[#EADED0] transition-colors shadow-xl"
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

            {/* Hero Gallery Section */}
            <section className="max-w-7xl mx-auto px-6 mt-32">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-serif text-black mb-4">The Tutu & Co Experience</h2>
                    <p className="text-[#95714F]/60 max-w-xl mx-auto">A glimpse into the life of our pet-loving community. Follow us @TutuAndCo</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((img, index) => (
                        <motion.div 
                            key={index}
                            whileHover={{ opacity: 0.9, scale: 0.98 }}
                            className="aspect-square bg-gray-100 overflow-hidden relative cursor-pointer"
                        >
                            <img 
                                src={img} 
                                alt={`Gallery ${index + 1}`} 
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                            />
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
