import React from 'react';
import { Link } from 'react-router-dom';

import { useShop } from '../context/ShopContext';

const Footer = () => {
    const { settings } = useShop();
    return (
        <footer className="bg-brand-cream border-t border-brand-charcoal/10 py-24">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
                <div className="space-y-6">
                    <h3 className="text-2xl font-serif text-black">{settings.shopName}</h3>
                    <p className="text-brand-charcoal/70 text-sm leading-relaxed">
                        Curating organic comfort and timeless style for your most beloved companions. Designed in London, enjoyed worldwide.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-black uppercase tracking-widest text-[10px] mb-8">Shop</h4>
                    <ul className="space-y-4 text-sm text-brand-charcoal/70">
                        <li><Link to="/" className="hover:text-black transition-colors">All Collections</Link></li>
                        <li><Link to="/collab" className="hover:text-black transition-colors">Collaborations</Link></li>
                        <li><Link to="/sizing" className="hover:text-black transition-colors">Sizing Guide</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-black uppercase tracking-widest text-[10px] mb-8">Support</h4>
                    <ul className="space-y-4 text-sm text-brand-charcoal/70">
                        <li><Link to="/policy/shipping" className="hover:text-black transition-colors">Shipping Info</Link></li>
                        <li><Link to="/policy/returns" className="hover:text-black transition-colors">Returns & Exchanges</Link></li>
                        <li><Link to="/policy/care" className="hover:text-black transition-colors">Product Care</Link></li>
                        <li><Link to="/policy/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-black uppercase tracking-widest text-[10px] mb-8">Newsletter</h4>
                    <p className="text-xs text-brand-charcoal/70 mb-6">Join our community for early access and pet care tips.</p>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="bg-transparent border-b border-brand-charcoal/30 py-2	flex-grow focus:outline-none text-sm placeholder-brand-charcoal/40"
                        />
                        <button className="text-black text-xs font-bold uppercase tracking-widest ml-4 hover:opacity-70 transition-opacity">Join</button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-brand-charcoal/10 flex flex-col md:flex-row justify-between items-center text-[10px] text-brand-charcoal/60 uppercase tracking-widest font-bold">
                <span>{settings.footerText || `© 2026 ${settings.shopName}. Crafted with care.`}</span>
                <div className="flex space-x-8 mt-6 md:mt-0">
                    <Link to="/moments" className="hover:text-black transition-colors">User Gallery</Link>
                    <Link to="/blogs" className="hover:text-black transition-colors">Journal</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
