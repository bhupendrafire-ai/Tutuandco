
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import mockApi from '../api/mockApi';
import { getProductImage } from '../context/ShopContext';
import logo from '../assets/logo.png';


const BlogPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        mockApi.getBlogs().then(blogs => {
            const found = blogs.find(b => b.id === id);
            setPost(found);
            setLoading(false);
            window.scrollTo(0, 0);
        });
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-serif">Loading Article...</div>;
    if (!post) return <div className="min-h-screen flex items-center justify-center font-serif">Article Not Found</div>;

    return (
        <div className="bg-white min-h-screen pt-32 pb-32">
            <div className="max-w-4xl mx-auto px-6">
                <Link to="/blogs" className="inline-flex items-center text-[#95714F] hover:opacity-70 transition-all mb-16 group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Journal
                </Link>

                <motion.header 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center space-x-6 text-[10px] uppercase tracking-widest text-[#8C916C] font-bold mb-6">
                        <span className="flex items-center"><Calendar size={12} className="mr-2" /> {post.date}</span>
                        <span className="flex items-center"><User size={12} className="mr-2" /> {post.author}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif text-black leading-tight mb-8">
                        {post.title}
                    </h1>
                </motion.header>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video bg-[#F8F4F0] rounded-sm overflow-hidden mb-16 shadow-lg"
                >
                    <img 
                        src={getProductImage(post.imageName)} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                <article className="prose prose-lg max-w-none text-[#95714F] leading-relaxed">
                    <p className="text-xl font-serif italic mb-12 text-black opacity-80 border-l-4 border-[#8C916C] pl-8 py-2">
                        {post.excerpt}
                    </p>
                    <div className="space-y-8 whitespace-pre-wrap">
                        {post.content}
                    </div>
                </article>

                <footer className="mt-24 pt-12 border-t border-[#EADED0] flex flex-col sm:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-6">
                        <img src={logo} alt="Tutu & Co" className="h-8 w-auto" />
                        <div className="h-8 w-px bg-[#EADED0]" />
                        <div>
                            <p className="text-sm font-bold text-black uppercase tracking-widest">Global Team</p>
                            <p className="text-xs text-[#95714F]">Pet Apparel Enthusiasts</p>
                        </div>
                    </div>
                    <button className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-[#95714F] hover:opacity-70 transition-opacity">
                        <Share2 size={16} />
                        <span>Share Article</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BlogPost;
