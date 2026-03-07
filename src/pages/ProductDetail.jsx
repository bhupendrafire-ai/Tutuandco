import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ChevronRight, Minus, Plus, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('M');

    // Specific product data for Tutu & Co
    const product = {
        name: "Organic Cotton Essential Tee",
        price: "$32.00",
        rating: 5,
        reviews: 124,
        description: "Our signature tee is made from 100% GOTS certified organic cotton. Designed for maximum comfort and freedom of movement, it's the perfect everyday layer for your stylish companion.",
        image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop",
        thumbnails: [
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1964&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=2071&auto=format&fit=crop"
        ]
    };

    return (
        <div className="pb-20">
            <div className="max-w-7xl mx-auto px-6 pt-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#95714F]/60 mb-8">
                    <span>Shop</span>
                    <ChevronRight size={12} />
                    <span>Apparel</span>
                    <ChevronRight size={12} />
                    <span className="text-[#95714F]">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-[4/5] bg-[#EADED0] rounded-sm overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {product.thumbnails.map((thumb, i) => (
                                <div key={i} className="aspect-square bg-[#EADED0] rounded-sm overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                                    <img src={thumb} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="lg:sticky lg:top-32 h-fit space-y-8">
                        <div>
                            <h1 className="text-4xl font-serif text-black mb-4">{product.name}</h1>
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < product.rating ? "#95714F" : "none"} className="text-[#95714F]" />
                                    ))}
                                </div>
                                <span className="text-sm text-[#95714F]/60">({product.reviews} customer reviews)</span>
                            </div>
                            <p className="text-2xl font-medium text-black">{product.price}</p>
                        </div>

                        <p className="text-[#95714F] leading-relaxed italic">
                            {product.description}
                        </p>

                        {/* Selectors */}
                        <div className="space-y-6 pt-4">
                            <div>
                                <label className="block text-xs font-bold text-[#95714F] uppercase tracking-wider mb-3">Size</label>
                                <div className="flex space-x-3">
                                    {['S', 'M', 'L', 'XL'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-sm border transition-colors ${selectedSize === size ? 'bg-[#95714F] text-white border-[#95714F]' : 'border-[#C7AF94] text-[#95714F] bg-white'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#95714F] uppercase tracking-wider mb-3">Quantity</label>
                                <div className="flex items-center space-x-4 w-32 border border-[#C7AF94] rounded-sm bg-white overflow-hidden">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-[#95714F] hover:bg-gray-50"><Minus size={14} /></button>
                                    <span className="flex-grow text-center text-sm font-medium">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-[#95714F] hover:bg-gray-50"><Plus size={14} /></button>
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-[#8C916C] text-white py-5 rounded-sm font-medium hover:bg-[#95714F] transition-colors uppercase tracking-[0.2em] text-sm shadow-sm">
                            Add to Shopping Bag
                        </button>

                        {/* Accordions (Simplified as simple blocks for Tutu & Co) */}
                        <div className="pt-10 divide-y divide-[#C7AF94]/20">
                            <div className="py-4 flex items-center space-x-4 text-sm text-[#95714F]">
                                <ShieldCheck size={20} className="text-[#8C916C]" />
                                <span>100% GOTS Certified Organic Materials</span>
                            </div>
                            <div className="py-4 flex items-center space-x-4 text-sm text-[#95714F]">
                                <Truck size={20} className="text-[#8C916C]" />
                                <span>Free Express Shipping on orders over $150</span>
                            </div>
                            <div className="py-4 flex items-center space-x-4 text-sm text-[#95714F]">
                                <RefreshCw size={20} className="text-[#8C916C]" />
                                <span>30-Day Effortless Returns & Exchanges</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
