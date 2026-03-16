import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, ShoppingBag, Heart, Shield, Truck, RefreshCcw } from 'lucide-react';

// Import all images from the folder
const imageModules = import.meta.glob('../assets/heroshots/*.{jpg,png,jpeg}', { eager: true });
const allImages = Object.values(imageModules).map(m => m.default);

const productsData = {
    "orange": {
        id: "orange",
        name: "Sunset Sage Bandana",
        price: "$28.00",
        rating: 5,
        mainImage: allImages.find(img => img.includes('IMG_6154')),
        description: "A vibrant burst of autumn hues, the Sunset Sage Bandana features an intricate earthy pattern. Designed for the adventurous pet who loves to stand out in the golden hour.",
        details: ["100% Organic Cotton", "Hand-stitched in small batches", "Breathable & Lightweight", "Machine Washable"]
    },
    "pink": {
        id: "pink",
        name: "Blossom Heart Bandana",
        price: "$32.00",
        rating: 5,
        mainImage: allImages.find(img => img.includes('IMG_6169')) || allImages.find(img => img.includes('IMG_6176')),
        description: "Soft, sweet, and perfectly charming. This pink checkered bandana is adorned with delicate white hearts, bringing a touch of romance to every walk.",
        details: ["Premium Linen Blend", "Signature Heart Pattern", "Reinforced Stitching", "Adjustable Fit"]
    },
    "blue": {
        id: "blue",
        name: "Azure Adventure Collab",
        price: "$35.00",
        rating: 5,
        mainImage: allImages.find(img => img.includes('IMG_6214')) || allImages.find(img => img.includes('IMG_6219')),
        description: "Deep azure tones meet modern geometric patterns. This piece is built for durability and style, perfect for long weekends in the hills or city strolls.",
        details: ["Utility Grade Fabric", "Reflective Accents", "Quick-Dry Tech", "Comfort-First Design"]
    },
    "nano-banana": {
        id: "nano-banana",
        name: "The Nano Banana Special",
        price: "$30.00",
        rating: 5,
        mainImage: allImages.find(img => img.includes('nano_banana')),
        description: "A quirky and minimalist take on the classic banana print. The Nano Banana features tiny, hand-drawn motifs on a soft sage canvas, offering a refined yet playful look.",
        details: ["Custom Illustration Print", "Eco-Friendly Dyes", "Extra Soft Finish", "Limited Edition Cloth"]
    }
};

const ProductDetail = () => {
    const { id } = useParams();
    const product = productsData[id] || productsData["orange"];
    const [selectedImage, setSelectedImage] = useState(product.mainImage);

    useEffect(() => {
        setSelectedImage(product.mainImage);
        window.scrollTo(0, 0);
    }, [product]);

    return (
        <div className="bg-white min-h-screen pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumbs */}
                <Link to="/" className="inline-flex items-center text-[#95714F] hover:opacity-70 transition-opacity mb-12 group">
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-[4/5] bg-[#EADED0] rounded-sm overflow-hidden"
                        >
                            <img 
                                src={selectedImage} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                        
                        <div className="grid grid-cols-5 gap-4">
                            {allImages.slice(0, 10).map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-square bg-[#EADED0] rounded-sm overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-[#95714F]' : 'border-transparent'}`}
                                >
                                    <img src={img} alt="Gallery thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-[#8C916C] mb-4">Tutu & Co Signature</span>
                        <h1 className="text-4xl md:text-5xl font-serif text-black mb-6">{product.name}</h1>
                        
                        <div className="flex items-center mb-8">
                            <div className="flex mr-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="#95714F" className="text-[#95714F]" />
                                ))}
                            </div>
                            <span className="text-[#95714F] text-sm">(24 Reviews)</span>
                        </div>

                        <p className="text-3xl font-light text-black mb-8">{product.price}</p>
                        
                        <p className="text-[#95714F] leading-relaxed mb-10 text-lg">
                            {product.description}
                        </p>

                        <div className="space-y-4 mb-12">
                            {product.details.map((detail, i) => (
                                <div key={i} className="flex items-center text-sm text-[#95714F]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#8C916C] mr-3" />
                                    {detail}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mb-16">
                            <button className="flex-1 bg-black text-white py-5 rounded-sm flex items-center justify-center font-medium tracking-widest uppercase text-sm hover:bg-[#1a1a1a] transition-colors shadow-lg">
                                <ShoppingBag size={18} className="mr-2" />
                                Add to Cart
                            </button>
                            <button className="px-8 py-5 border border-[#C7AF94] rounded-sm hover:bg-[#EADED0]/30 transition-colors">
                                <Heart size={18} className="text-[#95714F]" />
                            </button>
                        </div>

                        {/* Shipping Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-10 border-t border-[#EADED0]">
                            <div className="flex flex-col items-center text-center">
                                <Truck size={20} className="text-[#95714F] mb-3" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-black">Fast Shipping</span>
                                <span className="text-[10px] text-[#95714F]">2-4 Business Days</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <RefreshCcw size={20} className="text-[#95714F] mb-3" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-black">Easy Returns</span>
                                <span className="text-[10px] text-[#95714F]">30 Day Window</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Shield size={20} className="text-[#95714F] mb-3" />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-black">Secure Payment</span>
                                <span className="text-[10px] text-[#95714F]">SSL Encrypted</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Imagery Section */}
                <section className="mt-32 pt-32 border-t border-[#EADED0]">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif text-black mb-4">Complete Showcase</h2>
                        <p className="text-[#95714F]/60">Every angle of the craftsmanship.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {allImages.map((img, index) => (
                            <motion.div 
                                key={index}
                                whileHover={{ y: -10 }}
                                className="aspect-[3/4] bg-[#EADED0] rounded-sm overflow-hidden cursor-zoom-in"
                            >
                                <img src={img} alt={`Showcase ${index}`} className="w-full h-full object-cover" />
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProductDetail;
