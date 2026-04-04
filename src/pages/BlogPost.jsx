
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { useShop, getProductImage, FINAL_API_URL } from '../context/ShopContext';
import logo from '../assets/logo.png';


const BlogPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPost = async () => {
            try {
                const res = await fetch(`${FINAL_API_URL}/api/blogs`);
                const blogs = await res.json();
                const found = blogs.find(b => String(b.id) === String(id));
                setPost(found);
            } catch (err) {
                console.error("Error loading blog post:", err);
            } finally {
                setLoading(false);
                window.scrollTo(0, 0);
            }
        };
        loadPost();
    }, [id, FINAL_API_URL]);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-medium">Loading journal...</div>;
    if (!post) return <div className="min-h-screen flex items-center justify-center font-medium">Article not found</div>;

    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-4xl mx-auto px-6">
                <Link to="/blogs" className="inline-flex items-center text-brand-charcoal opacity-70 hover:opacity-100 transition-all mb-16 group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to journal
                </Link>

                <motion.header 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center space-x-6 text-[11px] text-brand-charcoal opacity-40 font-medium mb-6">
                        <span className="flex items-center"><Calendar size={12} className="mr-2" /> {post.date}</span>
                        <span className="flex items-center"><User size={12} className="mr-2" /> {post.author}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-medium text-brand-charcoal leading-tight mb-8">
                        {post.title}
                    </h1>
                </motion.header>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-video bg-brand-cream rounded-sm overflow-hidden mb-16 shadow-lg"
                >
                    <img 
                        src={getProductImage(post.imageName)} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                <article className="prose prose-lg max-w-none text-brand-charcoal/70 leading-relaxed">
                    <p className="text-xl font-medium italic mb-12 text-brand-charcoal opacity-80 border-l-4 border-brand-charcoal/20 pl-8 py-2">
                        {post.excerpt}
                    </p>
                    <div className="space-y-8 whitespace-pre-wrap">
                        {post.content}
                    </div>
                </article>

                <footer className="mt-24 pt-12 border-t border-brand-charcoal/10 flex flex-col sm:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-6">
                        <img src={logo} alt="Tutu & Co" className="h-8 w-auto" />
                        <div className="h-8 w-px bg-brand-charcoal/10" />
                        <div>
                            <p className="text-sm font-medium text-brand-charcoal">Global team</p>
                            <p className="text-xs text-brand-charcoal/60">Pet apparel enthusiasts</p>
                        </div>
                    </div>
                    <button onClick={() => window.history.back()} className="flex items-center space-x-2 text-[11px] font-medium text-brand-charcoal/60 hover:opacity-100 transition-opacity">
                        <ArrowLeft size={16} />
                        <span>Back to journal</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BlogPost;
