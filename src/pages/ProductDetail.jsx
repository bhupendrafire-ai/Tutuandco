import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, ShoppingBag, Heart, Shield, Truck, RefreshCcw } from 'lucide-react';
import { useShop, getProductImage } from '../context/ShopContext';
import mockApi from '../api/mockApi';

// Import all images from the folder
const imageModules = import.meta.glob('../assets/heroshots/*.{jpg,png,jpeg}', { eager: true });
const allImages = Object.values(imageModules).map(m => m.default).filter(img => typeof img === 'string');


const ProductDetail = () => {
    const { id } = useParams();
    const { products, addToCart, loading, formatPrice, settings, media } = useShop();
    const [selectedImage, setSelectedImage] = useState(null);
    const [reviews, setReviews] = useState([]);
    
    const product = products.find(p => String(p.id) === String(id)) || products[0];

    useEffect(() => {
        if (product) {
            const mainImg = product.images?.sort((a,b) => a.sequence - b.sequence)[0]?.url || product.imageName;
            setSelectedImage(getProductImage(mainImg, media));
            mockApi.getReviews(product.id).then(setReviews);
        }
        window.scrollTo(0, 0);
    }, [product]);

    if (loading || !product) return <div className="min-h-screen flex items-center justify-center font-serif">Loading Product...</div>;

    const handleAddToCart = () => {
        addToCart(product);
        alert(`${product.name} added to cart!`);
    };

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
                            key={selectedImage}
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
                            {(product.images?.length > 0 ? product.images.sort((a,b) => a.sequence - b.sequence) : [{url: product.imageName}]).map((imgObj, index) => {
                                const imgUrl = getProductImage(imgObj.url, media);
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(imgUrl)}
                                        className={`aspect-square bg-[#EADED0] rounded-sm overflow-hidden border-2 transition-all ${selectedImage === imgUrl ? 'border-[#95714F]' : 'border-transparent'}`}
                                    >
                                        <img src={imgUrl} alt="Gallery thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-[#8C916C] mb-4">Tutu & Co Signature</span>
                        <h1 className="text-4xl md:text-5xl font-serif text-black mb-6">{product.name}</h1>
                        
                        <div className="flex items-center mb-8">
                            <div className="flex mr-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < product.rating ? "#95714F" : "none"} className="text-[#95714F]" />
                                ))}
                            </div>
                            <span className="text-[#95714F] text-sm">({reviews.length} Reviews)</span>
                        </div>

                        <div className="flex items-center space-x-4 mb-8">
                            <p className="text-3xl font-serif text-[#CD664D]">
                                {formatPrice(product.discountPrice || product.price)}
                            </p>
                            {product.discountPrice && (
                                <p className="text-lg opacity-30 line-through">
                                    {formatPrice(product.price)}
                                </p>
                            )}
                        </div>
                        
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
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 bg-black text-white py-5 rounded-sm flex items-center justify-center font-medium tracking-widest uppercase text-sm hover:bg-[#1a1a1a] transition-colors shadow-lg"
                            >
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

                {/* Story Builder Blocks */}
                {product.descriptionBlocks?.length > 0 && (
                    <section className="mt-32 space-y-32">
                        {product.descriptionBlocks.map((block, i) => {
                            if (block.template === 'wide_banner') {
                                return (
                                    <div key={i} className="space-y-12">
                                        <h3 className="text-4xl md:text-6xl font-serif text-center text-black italic max-w-4xl mx-auto leading-tight">{block.title}</h3>
                                        <div className="w-full aspect-[21/9] bg-[#F4F1EA] rounded-sm overflow-hidden shadow-xl">
                                            <img src={getProductImage(block.url, media)} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-[#95714F] text-xl text-center max-w-3xl mx-auto leading-relaxed">{block.content}</p>
                                    </div>
                                );
                            }

                            if (block.template === 'grid_spotlight') {
                                return (
                                    <div key={i} className="space-y-16">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                                            {block.items.map((item, j) => (
                                                <div key={j} className="space-y-6 text-center">
                                                    <div className="aspect-square bg-[#F4F1EA] rounded-sm overflow-hidden shadow-md">
                                                        <img src={getProductImage(item.url, media)} className="w-full h-full object-cover" />
                                                    </div>
                                                    <h4 className="text-xl font-serif italic text-black">{item.title}</h4>
                                                    <ul className="space-y-2">
                                                        {item.bullets?.map((bullet, k) => bullet && (
                                                            <li key={k} className="text-[10px] uppercase font-bold tracking-widest text-[#CD664D]">{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            if (block.template === 'overlay_feature') {
                                return (
                                    <div key={i} className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-[#F4F1EA] rounded-sm overflow-hidden shadow-2xl">
                                        <img src={getProductImage(block.url, media)} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent pointer-events-none" />
                                        <div className="absolute top-8 left-8 md:top-16 md:left-16 max-w-[90%] md:max-w-[30%] space-y-6">
                                            <h3 className="text-3xl md:text-5xl font-serif text-black leading-tight italic break-words">{block.title}</h3>
                                            <p className="text-black/80 text-sm md:text-lg leading-relaxed">{block.content}</p>
                                        </div>
                                    </div>
                                );
                            }

                            if (block.template === 'alternating_items') {
                                return (
                                    <div key={i} className="space-y-32">
                                        {block.items.map((item, j) => (
                                            <div key={j} className={`flex flex-col ${j % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center`}>
                                                <div className="flex-1 w-full aspect-square bg-[#F4F1EA] rounded-sm overflow-hidden shadow-xl">
                                                    <img src={getProductImage(item.url, media)} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 space-y-6">
                                                    <h4 className="text-3xl md:text-4xl font-serif italic text-black leading-tight">{item.title}</h4>
                                                    <p className="text-[#95714F] text-lg leading-relaxed">{item.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }

                            // Default rendering for legacy blocks
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    key={i} 
                                    className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-16 items-center`}
                                >
                                    {block.type === 'image' && (
                                        <div className="flex-1 w-full aspect-[4/5] bg-[#F4F1EA] rounded-sm overflow-hidden shadow-2xl">
                                            <img src={getProductImage(block.url, media)} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-8">
                                        <h3 className="text-4xl md:text-5xl font-serif text-black leading-tight italic">
                                            {block.title}
                                        </h3>
                                        <p className="text-[#95714F] text-lg leading-relaxed">
                                            {block.content}
                                        </p>
                                        {block.bullets?.length > 0 && (
                                            <ul className="space-y-4">
                                                {block.bullets.map((bullet, j) => (
                                                    <li key={j} className="flex items-center text-[#3E362E] font-serif italic">
                                                        <span className="w-2 h-2 rounded-full bg-[#CD664D] mr-4" />
                                                        {bullet}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </section>
                )}


                {/* Reviews Section */}
                <section className="mt-32 pt-32 border-t border-[#EADED0]">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
                        <div>
                            <h2 className="text-4xl font-serif text-black mb-4">Customer Reviews</h2>
                            <div className="flex items-center">
                                <div className="flex mr-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} fill={i < product.rating ? "#95714F" : "none"} className="text-[#95714F]" />
                                    ))}
                                </div>
                                <span className="text-[#95714F] font-bold">{(Number(product.rating) || 5).toFixed(1)} out of 5</span>
                            </div>
                        </div>
                        <button className="text-[10px] uppercase font-bold tracking-[0.2em] border-2 border-black px-10 py-4 hover:bg-black hover:text-white transition-all">
                            Write a Review
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Review List */}
                        <div className="space-y-12">
                            {reviews.length > 0 ? reviews.map((review, i) => (
                                <div key={i} className="pb-8 border-b border-[#F8F4F0]">
                                    <div className="flex items-center mb-4">
                                        <div className="flex mr-4">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} size={12} fill={j < review.rating ? "#95714F" : "none"} className="text-[#95714F]" />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-black uppercase tracking-widest">{review.userName}</span>
                                    </div>
                                    <h4 className="font-serif text-black mb-2">{review.title}</h4>
                                    <p className="text-[#95714F] text-sm leading-relaxed mb-4">{review.comment}</p>
                                    <span className="text-[10px] text-[#95714F]/40 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                            )) : (
                                <p className="text-[#95714F] italic">No reviews yet. Be the first to share your experience!</p>
                            )}
                        </div>

                        {/* Review Form */}
                        <div className="bg-[#F8F4F0] p-10 rounded-sm h-fit">
                            <h3 className="text-xl font-serif text-black mb-8">Tell us what you think</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const data = {
                                    productId: product.id,
                                    userName: e.target.userName.value,
                                    rating: parseInt(e.target.rating.value),
                                    title: e.target.title.value,
                                    comment: e.target.comment.value
                                };
                                await mockApi.addReview(data);
                                mockApi.getReviews(product.id).then(setReviews);
                                e.target.reset();
                                alert("Review submitted! Thank you.");
                            }} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-[#95714F] tracking-widest mb-2">Display Name</label>
                                    <input required name="userName" className="w-full bg-white border border-[#C7AF94]/30 p-4 text-sm focus:border-[#95714F] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-[#95714F] tracking-widest mb-2">Rating</label>
                                    <select name="rating" className="w-full bg-white border border-[#C7AF94]/30 p-4 text-sm focus:border-[#95714F] outline-none appearance-none">
                                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-[#95714F] tracking-widest mb-2">Review Title</label>
                                    <input required name="title" className="w-full bg-white border border-[#C7AF94]/30 p-4 text-sm focus:border-[#95714F] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-[#95714F] tracking-widest mb-2">Your Experience</label>
                                    <textarea required name="comment" rows="4" className="w-full bg-white border border-[#C7AF94]/30 p-4 text-sm focus:border-[#95714F] outline-none" />
                                </div>
                                <button type="submit" className="w-full bg-black text-white py-5 font-bold uppercase tracking-widest text-[10px] hover:bg-[#1a1a1a]">Post Review</button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Full Imagery Section */}
                <section className="mt-32 pt-32 border-t border-[#EADED0]">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-serif text-black mb-4">Complete Showcase</h2>
                        <p className="text-[#95714F]/60">Every angle of the craftsmanship.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {allImages.slice(0, 8).map((img, index) => (
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
