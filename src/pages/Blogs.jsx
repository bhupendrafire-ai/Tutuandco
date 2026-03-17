
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User } from 'lucide-react';
import mockApi from '../api/mockApi';
import { getProductImage } from '../context/ShopContext';

const Blogs = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        mockApi.getBlogs().then(data => {
            setPosts(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-serif">Loading Journal...</div>;

    return (
        <div className="bg-white min-h-screen pt-32 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                <header className="text-center mb-24">
                    <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#8C916C] mb-6 block">Tutu & Co Journal</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-black mb-8">Stories & Care</h1>
                    <p className="text-[#95714F] max-w-xl mx-auto text-lg font-light leading-relaxed">
                        Insights into pet wellness, sustainable living, and the community behind our craftsmanship.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {posts.map((post, index) => (
                        <motion.div 
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <Link to={`/blogs/${post.id}`} className="block overflow-hidden rounded-sm bg-[#F8F4F0] mb-8 aspect-[16/9]">
                                <img 
                                    src={getProductImage(post.imageName)} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                            </Link>
                            <div className="flex items-center space-x-6 text-[10px] uppercase tracking-widest text-[#8C916C] font-bold mb-4">
                                <span className="flex items-center"><Calendar size={12} className="mr-2" /> {post.date}</span>
                                <span className="flex items-center"><User size={12} className="mr-2" /> {post.author}</span>
                            </div>
                            <h2 className="text-3xl font-serif text-black mb-6 group-hover:text-[#95714F] transition-colors">{post.title}</h2>
                            <p className="text-[#95714F] leading-relaxed mb-8 flex-grow">
                                {post.excerpt}
                            </p>
                            <Link 
                                to={`/blogs/${post.id}`} 
                                className="inline-flex items-center text-[10px] uppercase font-bold tracking-[0.2em] text-black border-b-2 border-black pb-2 hover:opacity-70 transition-all group/link"
                            >
                                Read Full Story 
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
