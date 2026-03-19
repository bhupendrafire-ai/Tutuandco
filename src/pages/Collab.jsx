
import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { getProductImage } from '../context/ShopContext';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';


const Collab = () => {
    return (
        <div className="bg-white min-h-screen pt-32 pb-32">
            <div className="max-w-7xl mx-auto px-6">
                <header className="text-center mb-32">
                    <div className="flex flex-col items-center mb-6">
                        <img src={logo} alt="Tutu & Co" className="h-10 w-auto mb-2" />
                        <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#8C916C]">Creative</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-serif text-black mb-12">Partnerships</h1>
                    <p className="text-[#95714F] max-w-2xl mx-auto text-xl font-light leading-relaxed">
                        We collaborate with artists, independent makers, and visionaries to create limited edition pieces that celebrate pet life.
                    </p>
                </header>

                <div className="space-y-32">
                    {/* Featured Collab */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="aspect-square bg-[#F8F4F0] rounded-sm overflow-hidden">
                            <img src={getProductImage('IMG_6186')} alt="Artist Collab" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-widest text-[#8C916C] font-bold mb-4 block">Spring 2024 Collection</span>
                            <div className="flex items-center mb-8">
                                <img src={logo} alt="Tutu & Co" className="h-8 w-auto mr-4" />
                                <span className="text-3xl font-serif text-black">x Minimalist Artisan</span>
                            </div>

                            <p className="text-[#95714F] leading-relaxed mb-10 text-lg">
                                Our latest partnership explores the intersection of traditional weaving techniques and modern pet ergonomics. 
                                Each piece is numbered and crafted using reclaimed designer fabrics.
                            </p>
                            <button className="bg-black text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] transition-all">
                                Shop the Collab
                            </button>
                        </div>
                    </section>

                    {/* Proposal Section */}
                    <section className="bg-[#F8F4F0] py-32 px-10 text-center rounded-sm">
                        <h2 className="text-4xl font-serif text-black mb-8">Design with Us</h2>
                        <p className="text-[#95714F] max-w-xl mx-auto mb-16 leading-relaxed">
                            Are you an artist or a brand aligned with our values of sustainability and quality? 
                            We'd love to hear your vision for a Tutu & Co collaboration.
                        </p>
                        <a 
                            href="mailto:collab@tutuandco.com" 
                            className="inline-flex items-center space-x-4 bg-white border border-[#C7AF94] px-12 py-6 text-[10px] font-bold uppercase tracking-[0.3em] text-black hover:bg-black hover:text-white transition-all group"
                        >
                            <Mail size={16} />
                            <span>Propose a Partnership</span>
                            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Collab;
