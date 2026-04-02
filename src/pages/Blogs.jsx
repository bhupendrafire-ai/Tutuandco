
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { useShop, getProductImage, FINAL_API_URL } from '../context/ShopContext';
import logo from '../assets/logo.png';


const Blogs = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBlogs = async () => {
            try {
                const res = await fetch(`${FINAL_API_URL}/api/blogs`);
                const data = await res.json();
                setPosts(data || []);
            } catch (err) {
                console.error("Error loading blogs:", err);
            } finally {
                setLoading(false);
            }
        };
        loadBlogs();
    }, [FINAL_API_URL]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-medium">Loading journal...</div>;

    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-[1440px] mx-auto px-3">
                <header className="text-center mb-24">
                    <div className="flex flex-col items-center mb-6">
                        <span className="text-[11px] font-medium text-brand-charcoal opacity-40">Journal</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-medium text-brand-charcoal mb-8">Stories & care</h1>
                    <p className="text-brand-charcoal/70 max-w-xl mx-auto text-lg font-light leading-relaxed">
                        Insights into pet wellness, sustainable living, and the community behind our craftsmanship.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {(Array.isArray(posts) ? posts : []).map((post, index) => (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <Link to={`/blogs/${post.id}`} className="block overflow-hidden rounded-sm bg-brand-cream mb-8 aspect-[16/9] shadow-sm">
                                <img 
                                    src={getProductImage(post.imageName, [])} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                            </Link>
                            <div className="flex items-center space-x-6 text-[11px] text-brand-charcoal opacity-40 font-medium mb-4">
                                <span className="flex items-center"><Calendar size={12} className="mr-2" /> {post.date || 'Tutu & Co'}</span>
                                <span className="flex items-center"><User size={12} className="mr-2" /> {post.author || 'Team'}</span>
                            </div>
                            <h2 className="text-3xl font-medium text-brand-charcoal mb-6 group-hover:opacity-60 transition-opacity">{post.title}</h2>
                            <p className="text-brand-charcoal/70 leading-relaxed mb-8 flex-grow">
                                {post.excerpt}
                            </p>
                            <Link 
                                to={`/blogs/${post.id}`} 
                                className="inline-flex items-center text-[10px] font-medium text-brand-charcoal border-b-2 border-brand-charcoal pb-2 hover:opacity-70 transition-all group/link"
                            >
                                Read story 
                                <ArrowRight size={14} className="ml-2 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blogs;
