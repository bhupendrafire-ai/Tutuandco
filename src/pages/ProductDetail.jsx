import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowLeft, ShoppingBag, Heart, Shield, Truck, RefreshCcw, Ruler } from 'lucide-react';
import { useShop, getProductImage, FINAL_API_URL } from '../context/ShopContext';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';
import SizeGuideModal from '../components/SizeGuideModal';


// Import all images from the folder
const imageModules = import.meta.glob('../assets/heroshots/*.{jpg,png,jpeg}', { eager: true });
const allImages = Object.values(imageModules).map(m => m.default).filter(img => typeof img === 'string');


const DEFAULT_DETAILS = [
    "Fabric: Premium cotton, lightweight and breathable",
    "Stitching: Reinforced for durability and everyday wear",
    "Fit: Adjustable with two snap button levels for a secure, comfortable fit",
    "Fastenings: High-quality, anti-tarnish snap buttons",
    "Comfort: Soft on fur and gentle on your pet’s skin",
    "Care: Designed for everyday wear and easy cleaning"
];


const ProductDetail = () => {
    const { id } = useParams();
    const { products, addToCart, loading, formatPrice, settings, media } = useShop();
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    
    const product = (Array.isArray(products) ? products : []).find(p => String(p.id) === String(id)) || products[0];

    useEffect(() => {
        if (product) {
            const safeImages = Array.isArray(product?.images) ? product.images : [];
            const mainImg = safeImages.length > 0 ? safeImages.sort((a,b) => a.sequence - b.sequence)[0]?.url : product?.imageName;
            setSelectedImage(getProductImage(mainImg, media));
            
            // Auto-select "Standard" if it's the only variant
            if (product.variants && product.variants.length === 1 && product.variants[0].size.toLowerCase() === 'standard') {
                setSelectedSize(product.variants[0].size);
            }

            // Load reviews from real API
            if (FINAL_API_URL && product.id) {
                fetch(`${FINAL_API_URL}/api/reviews/${product.id}`)
                    .then(res => res.json())
                    .then(data => setReviews(Array.isArray(data) ? data : []))
                    .catch(err => console.error("Error loading reviews:", err));
            }
        }
        window.scrollTo(0, 0);
    }, [product, FINAL_API_URL, media]);

    if (loading || !product || !settings) return <div className="min-h-screen flex items-center justify-center font-medium bg-brand-sage">Synchronizing product data...</div>;

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Please select a size first!");
            return;
        }
        const selectedVariant = (product.variants || []).find(v => v.size === selectedSize);
        // Use variant-specific price, falling back to product-level price if not set
        const finalPrice = selectedVariant?.price !== undefined ? selectedVariant.price : (product.discountPrice || product.price);
        addToCart(product, selectedSize, 1, finalPrice);
        alert(`${product.name} (Size: ${selectedSize}) added to cart!`);
    };

    return (
        <div className="bg-brand-sage min-h-screen pt-12 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumbs */}
                <Link to="/" className="inline-flex items-center text-brand-charcoal opacity-70 hover:opacity-100 transition-opacity mb-6 group">
                    <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 lg:gap-24">
                    {/* Image Gallery */}
                    <div className="space-y-6">
                        <motion.div 
                            key={selectedImage}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-[4/5] bg-brand-cream rounded-sm overflow-hidden shadow-sm"
                        >
                            <img 
                                src={selectedImage} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                        
                        <div className="grid grid-cols-6 gap-3">
                            {((Array.isArray(product.images) && product.images.length > 0) ? [...product.images].sort((a,b) => a.sequence - b.sequence) : [{url: product.imageName}]).map((imgObj, index) => {
                                const imgUrl = getProductImage(imgObj?.url, media);
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(imgUrl)}
                                        className={`aspect-square bg-brand-cream rounded-sm overflow-hidden border-2 transition-all ${selectedImage === imgUrl ? 'border-brand-charcoal' : 'border-transparent'}`}
                                    >
                                        <img src={imgUrl} alt="Gallery thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="flex items-center mb-4">
                            <img src={logo} alt="Tutu & Co" className="h-6 w-auto mr-3" />
                            <span className="text-[11px] font-medium text-brand-charcoal opacity-40">Signature collection</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-brand-charcoal mb-4 leading-[1.1] tracking-tight">{product.name}</h1>
                        
                        <div className="flex items-center mb-8">
                            <div className="flex mr-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < (Number(product.rating) || 5) ? "#2f2f2f" : "none"} className="text-brand-charcoal" />
                                ))}
                            </div>
                            <span className="text-brand-charcoal/40 text-[10px] items-center font-medium">({(Array.isArray(reviews) ? reviews : []).length} reviews)</span>
                        </div>

                        <div className="flex items-center space-x-6 mb-10">
                            <p className="text-4xl font-medium text-brand-charcoal">
                                {(() => {
                                    const variants = product.variants || [];
                                    const allOutOfStock = variants.length > 0 && variants.every(v => (v.stock || 0) <= 0);
                                    if (allOutOfStock) {
                                        return <span className="text-xl md:text-2xl opacity-40 uppercase tracking-widest font-normal">Out of Stock</span>;
                                    }
                                    return formatPrice(
                                        selectedSize 
                                            ? (variants.find(v => v.size === selectedSize)?.price ?? (product.discountPrice || product.price))
                                            : (variants.length > 0 
                                                ? Math.min(...variants.map(v => v.price ?? (product.discountPrice || product.price)))
                                                : (product.discountPrice || product.price))
                                    );
                                })()}
                            </p>
                            {(product.discountPrice || (selectedSize && (product.variants || []).find(v => v.size === selectedSize)?.price < product.price)) && (
                                <p className="text-lg opacity-20 line-through">
                                    {formatPrice(product.price)}
                                </p>
                            )}
                        </div>
                        
                        <p className="text-brand-charcoal/80 leading-relaxed mb-10 text-lg font-normal max-w-md">
                            {product.description}
                        </p>

                        {/* Size Selection */}
                        {!(product.variants && product.variants.length === 1 && product.variants[0].size.toLowerCase() === 'standard') && (
                            <div className="mb-10">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[13px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Select Size</h3>
                                    <button 
                                        onClick={() => setIsSizeModalOpen(true)}
                                        className="flex items-center space-x-2 text-[10px] font-bold text-brand-rose uppercase tracking-widest hover:opacity-70 transition-opacity"
                                    >
                                        <Ruler size={12} />
                                        <span>Size Guide</span>
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(product.variants && product.variants.length > 0 ? product.variants : []).map((variant) => {
                                        const isOutOfStock = (Number(variant.stock) || 0) <= 0;
                                        const isSelected = selectedSize === variant.size;
                                        
                                        return (
                                            <button
                                                key={variant.size}
                                                disabled={isOutOfStock}
                                                onClick={() => setSelectedSize(variant.size)}
                                                className={`
                                                    px-8 py-4 rounded-sm border-2 text-[11px] font-bold transition-all min-w-[80px] uppercase tracking-widest relative overflow-hidden
                                                    ${isSelected 
                                                        ? 'border-brand-charcoal bg-brand-charcoal text-white shadow-xl scale-105' 
                                                        : isOutOfStock 
                                                            ? 'border-brand-charcoal/5 bg-transparent text-brand-charcoal/20 cursor-not-allowed opacity-40' 
                                                            : 'border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-white shadow-sm'
                                                    }
                                                `}
                                            >
                                                {variant.size}
                                                {isOutOfStock && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-[120%] h-px bg-brand-charcoal/20 rotate-[-15deg] pointer-events-none" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                    {(!product.variants || product.variants.length === 0) && (
                                        <p className="text-xs italic text-brand-charcoal/40">No sizes available for this item.</p>
                                    )}
                                </div>
                                {selectedSize && (
                                    <p className="mt-4 text-[11px] font-bold text-green-700/60 uppercase tracking-widest animate-in fade-in slide-in-from-left-2 transition-all">
                                        {((product.variants || []).find(v => v.size === selectedSize)?.stock || 0)} units available in {selectedSize}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Primary CTA Section - Relocated above details for better conversion flow */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-12 mt-4">
                            <button 
                                onClick={handleAddToCart}
                                disabled={!selectedSize}
                                className={`
                                    px-16 py-8 flex items-center justify-center font-medium text-[18px] transition-all shadow-lg min-w-[240px]
                                    ${!selectedSize 
                                        ? 'bg-brand-charcoal/5 text-brand-charcoal/20 cursor-not-allowed' 
                                        : 'bg-brand-rose text-brand-charcoal hover:bg-white active:scale-95'
                                    }
                                `}
                            >
                                <ShoppingBag size={24} className="mr-3" />
                                {selectedSize ? 'Add to cart' : 'Select size to continue'}
                            </button>
                             <button className="px-10 py-8 border border-brand-charcoal/10 rounded-sm hover:bg-brand-cream/50 transition-colors">
                                <Heart size={20} className="text-brand-charcoal/40" />
                            </button>
                        </div>

                        {/* Refined Product Details Section - Scaled down typography by 10% */}
                        <div className="mb-4">
                            <h3 className="text-[16.2px] font-medium text-brand-charcoal tracking-tight">Product details</h3>
                        </div>

                        <div className="space-y-4 mb-16">
                            {((Array.isArray(product?.details) && product.details.length > 0) ? product.details : DEFAULT_DETAILS).map((detail, i) => (
                                <div key={i} className="flex items-start text-[14.4px] text-brand-charcoal/60 font-medium">
                                    <Heart size={13} className="text-brand-rose mr-4 mt-1 flex-shrink-0" fill="currentColor" />
                                    <span>
                                        {String(detail).includes(':') ? (
                                            <>
                                                <span className="font-bold text-brand-charcoal/80">{String(detail).split(':')[0]}:</span>
                                                {String(detail).split(':')[1]}
                                            </>
                                        ) : detail}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Info */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-brand-charcoal/5 pt-16">
                             <div className="flex flex-col items-center text-center">
                                 <Truck size={20} className="text-brand-charcoal/40 mb-3" />
                                 <span className="text-[11px] tracking-wider font-medium text-brand-charcoal">Fast shipping</span>
                                 <span className="text-[10px] text-brand-charcoal/40 font-medium">2-4 Business days</span>
                             </div>
                             <div className="flex flex-col items-center text-center">
                                 <RefreshCcw size={20} className="text-brand-charcoal/40 mb-3" />
                                 <span className="text-[11px] tracking-wider font-medium text-brand-charcoal">Easy returns</span>
                                 <span className="text-[10px] text-brand-charcoal/40 font-medium">30 Day window</span>
                             </div>
                             <div className="flex flex-col items-center text-center">
                                 <Shield size={20} className="text-brand-charcoal/40 mb-3" />
                                 <span className="text-[11px] tracking-wider font-medium text-brand-charcoal">Secure payment</span>
                                 <span className="text-[10px] text-brand-charcoal/40 font-medium">SSL Encrypted</span>
                             </div>
                             <div className="flex flex-col items-center text-center">
                                 <div className="flex items-center space-x-1 mb-3">
                                     {[...Array(5)].map((_, i) => (
                                         <span key={i} className="text-[#8B967E]">★</span>
                                     ))}
                                 </div>
                                 <span className="text-[11px] tracking-wider font-medium text-brand-charcoal">5 Star reviews</span>
                                 <span className="text-[10px] text-brand-charcoal/40 font-medium">Verified customers</span>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Story Builder Blocks */}
                {product?.descriptionBlocks?.length > 0 && (
                    <section className="mt-32 space-y-32">
                        {product.descriptionBlocks.map((block, i) => {
                            if (block.template === 'wide_banner') {
                                const positionClasses = {
                                    left: 'justify-start text-left',
                                    center: 'justify-center text-center',
                                    right: 'justify-end text-right'
                                };
                                const gradientClasses = {
                                    left: 'bg-gradient-to-r from-[#F4F1EA]/90 via-[#F4F1EA]/40 to-transparent',
                                    center: 'bg-gradient-to-b from-transparent via-[#F4F1EA]/20 to-[#F4F1EA]/60',
                                    right: 'bg-gradient-to-l from-[#F4F1EA]/90 via-[#F4F1EA]/40 to-transparent'
                                };
                                const pos = block.contentPosition || 'center';

                                return (
                                    <div key={i} className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-brand-cream rounded-sm overflow-hidden shadow-2xl group">
                                        <img 
                                            src={getProductImage(block.url, media)} 
                                            className="w-full h-full transition-transform duration-700 group-hover:scale-105" 
                                            style={{ 
                                                objectFit: block.fitMode || 'cover',
                                                objectPosition: `${block.focalPoint?.x || 50}% ${block.focalPoint?.y || 50}%`
                                            }}
                                        />
                                        
                                        {/* Dynamic Gradient Overlay */}
                                        <div className={`absolute inset-0 ${gradientClasses[pos]} pointer-events-none`} />

                                        {/* Positioned Content */}
                                        <div className={`absolute inset-0 flex items-center p-8 md:p-20 ${positionClasses[pos]}`}>
                                            <div className="max-w-2xl space-y-6">
                                                <h3 className="text-3xl md:text-5xl font-medium text-brand-charcoal leading-tight italic drop-shadow-sm">
                                                    {block.title || `Hero banner ${i + 1}`}
                                                </h3>
                                                <p className="text-brand-charcoal/80 text-sm md:text-xl leading-relaxed font-medium">
                                                    {block.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            if (block.template === 'grid_spotlight') {
                                return (
                                    <div key={i} className="space-y-16">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                                            {block.items.map((item, j) => (
                                                <div key={j} className="space-y-6 text-center">
                                                    <div className="aspect-square bg-brand-cream rounded-sm overflow-hidden shadow-md">
                                                        <img src={getProductImage(item.url, media)} className="w-full h-full object-cover" />
                                                    </div>
                                                    <h4 className="text-xl font-medium italic text-brand-charcoal">{item.title}</h4>
                                                    <ul className="space-y-3">
                                                        {item.bullets?.map((bullet, k) => bullet && (
                                                            <li key={k} className="text-[16.2px] font-medium text-brand-charcoal opacity-80 flex items-start space-x-3">
                                                                <Heart size={13} className="text-brand-rose mt-1 flex-shrink-0" fill="currentColor" />
                                                                <span>
                                                                    {bullet.includes(':') ? (
                                                                        <>
                                                                            <span className="font-bold">{bullet.split(':')[0]}:</span>
                                                                            {bullet.split(':')[1]}
                                                                        </>
                                                                    ) : bullet}
                                                                </span>
                                                            </li>
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
                                    <div key={i} className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-brand-cream rounded-sm overflow-hidden shadow-2xl">
                                        <img src={getProductImage(block.url, media)} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent pointer-events-none" />
                                        <div className="absolute top-8 left-8 md:top-16 md:left-16 max-w-[90%] md:max-w-[30%] space-y-6">
                                            <h3 className="text-3xl md:text-5xl font-medium text-brand-charcoal leading-tight italic break-words">{block.title}</h3>
                                            <p className="text-brand-charcoal/80 text-sm md:text-lg leading-relaxed">{block.content}</p>
                                        </div>
                                    </div>
                                );
                            }

                            if (block.template === 'alternating_items') {
                                return (
                                    <div key={i} className="space-y-32">
                                        {block.items.map((item, j) => (
                                            <div key={j} className={`flex flex-col ${j % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center`}>
                                                <div className="flex-1 w-full aspect-square bg-brand-cream rounded-sm overflow-hidden shadow-xl">
                                                    <img src={getProductImage(item.url, media)} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 space-y-6">
                                                    <h4 className="text-3xl md:text-4xl font-medium italic text-brand-charcoal leading-tight">{item.title}</h4>
                                                    <p className="text-brand-charcoal/80 text-lg leading-relaxed">{item.content}</p>
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
                                        <div className="flex-1 w-full aspect-[4/5] bg-brand-cream rounded-sm overflow-hidden shadow-2xl">
                                            <img src={getProductImage(block.url, media)} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-8">

                                        <h3 className="text-4xl md:text-5xl font-medium text-brand-charcoal leading-tight italic">
                                            {block.title}
                                        </h3>
                                        <p className="text-brand-charcoal/80 text-lg leading-relaxed">
                                            {block.content}
                                        </p>
                                        {block.bullets?.length > 0 && (
                                            <ul className="space-y-4">
                                                {block.bullets.map((bullet, j) => (
                                                    <li key={j} className="flex items-start text-brand-charcoal/80 text-[16.2px] italic">
                                                        <Heart size={14} className="text-brand-rose mr-4 mt-1.5 flex-shrink-0" fill="currentColor" />
                                                        <span>
                                                            {bullet.includes(':') ? (
                                                                <>
                                                                    <span className="font-bold italic-none not-italic">{bullet.split(':')[0]}:</span>
                                                                    {bullet.split(':')[1]}
                                                                </>
                                                            ) : bullet}
                                                        </span>
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
                <section className="mt-32 pt-32 border-t border-brand-charcoal/10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8">
                        <div>
                            <h2 className="text-4xl font-medium text-brand-charcoal mb-4">Customer reviews</h2>
                            <div className="flex items-center">
                                <div className="flex mr-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} fill={i < product.rating ? "#2f2f2f" : "none"} className="text-brand-charcoal" />
                                    ))}
                                </div>
                                <span className="text-brand-charcoal/60 font-medium">{(Number(product.rating) || 5).toFixed(1)} out of 5</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-[18px] font-medium bg-brand-rose text-brand-charcoal px-14 py-6 hover:bg-white transition-all shadow-md"
                        >
                            Write a review
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Review List */}
                        <div className="space-y-12">
                            {(Array.isArray(reviews) && reviews.length > 0) ? reviews.map((review, i) => (
                                <div key={i} className="pb-8 border-b border-[#F8F4F0]">
                                    <div className="flex items-center mb-4">
                                        <div className="flex mr-4">
                                            {[...Array(5)].map((_, j) => (
                                                <Star key={j} size={12} fill={j < (Number(review.rating) || 5) ? "#2f2f2f" : "none"} className="text-brand-charcoal" />
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium text-brand-charcoal/80 tracking-wide">{review.userName || 'Anonymous'}</span>
                                    </div>
                                    <h4 className="font-medium text-brand-charcoal mb-2">{review.title}</h4>
                                    <p className="text-brand-charcoal/70 text-sm leading-relaxed mb-4">{review.comment}</p>
                                    <span className="text-[10px] text-brand-charcoal/30 font-medium tracking-wide">
                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-brand-charcoal/40 italic">No reviews yet. Be the first to share your experience!</p>
                            )}
                        </div>

                        {/* Review Form */}
                        <div id="review-form" className="bg-brand-cream/50 p-10 rounded-sm h-fit">
                            <h3 className="text-xl font-medium text-brand-charcoal mb-8">Tell us what you think</h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const data = {
                                    productId: product.id,
                                    userName: e.target.userName.value,
                                    rating: parseInt(e.target.rating.value),
                                    title: e.target.title.value,
                                    comment: e.target.comment.value
                                };
                                
                                try {
                                    const res = await fetch(`${FINAL_API_URL}/api/reviews`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    if (res.ok) {
                                        const updatedReviews = await fetch(`${FINAL_API_URL}/api/reviews/${product.id}`).then(r => r.json());
                                        setReviews(updatedReviews);
                                        e.target.reset();
                                        alert("Review submitted! Thank you.");
                                    }
                                } catch (err) {
                                    console.error("Error posting review:", err);
                                    alert("Could not post review. Please try again later.");
                                }
                            }} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-2">Display name</label>
                                    <input required name="userName" className="w-full bg-white border border-brand-charcoal/10 p-4 text-sm focus:border-brand-charcoal outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-2">Rating</label>
                                    <select name="rating" className="w-full bg-white border border-brand-charcoal/10 p-4 text-sm focus:border-brand-charcoal outline-none appearance-none">
                                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-2">Review title</label>
                                    <input required name="title" className="w-full bg-white border border-brand-charcoal/10 p-4 text-sm focus:border-brand-charcoal outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-brand-charcoal/40 mb-2">Your experience</label>
                                    <textarea required name="comment" rows="4" className="w-full bg-white border border-brand-charcoal/10 p-4 text-sm focus:border-brand-charcoal outline-none" />
                                </div>
                                <button type="submit" className="w-full bg-brand-rose text-brand-charcoal py-6 font-medium text-[18px] hover:bg-white transition-all">Post review</button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Full Imagery Section */}
                <section className="mt-32 pt-32 border-t border-brand-charcoal/10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-medium text-brand-charcoal mb-4">Complete showcase</h2>
                        <p className="text-brand-charcoal/40">Every angle of the craftsmanship.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {((Array.isArray(product.images) && product.images.length > 0) ? product.images : [{url: product.imageName}]).map((imgObj, index) => (
                            <motion.div 
                                key={index}
                                whileHover={{ y: -10 }}
                                className="aspect-[3/4] bg-brand-cream rounded-sm overflow-hidden cursor-zoom-in shadow-sm"
                            >
                                <img src={getProductImage(imgObj?.url, media)} alt={`Showcase ${index}`} className="w-full h-full object-cover" />
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
             <SizeGuideModal 
                isOpen={isSizeModalOpen} 
                onClose={() => setIsSizeModalOpen(false)} 
            />
        </div>
    );
};

export default ProductDetail;
