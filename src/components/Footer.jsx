import React from 'react';
import { Link } from 'react-router-dom';

import { useShop } from '../context/ShopContext';

const Footer = () => {
    const { settings } = useShop();
    return (
        <footer className="bg-brand-cream border-t border-brand-charcoal/10 py-16 transition-all duration-700">
            <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
                <div className="space-y-8">
                    <h3 className="text-2xl font-medium text-[#2f2f2f] tracking-tight">{settings.shopName}</h3>
                    <p className="text-[#6f6f6f] text-sm leading-relaxed italic">
                        Curating organic comfort and timeless style for your most beloved companions. Designed in London, enjoyed worldwide.
                    </p>
                </div>
                <div>
                    <h4 className="font-medium text-[#2f2f2f] text-[11px] uppercase tracking-widest mb-10">Shop Collections</h4>
                    <ul className="space-y-4 text-sm text-[#6f6f6f] font-normal">
                        <li><Link to="/" className="hover:text-[#2f2f2f] transition-colors">All Collections</Link></li>
                        <li><Link to="/collab" className="hover:text-[#2f2f2f] transition-colors">Collaborations</Link></li>
                        <li><Link to="/sizing" className="hover:text-[#2f2f2f] transition-colors">Sizing Guide</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-medium text-[#2f2f2f] text-[11px] uppercase tracking-widest mb-10">Support & Care</h4>
                    <ul className="space-y-4 text-sm text-[#6f6f6f] font-normal">
                        <li><Link to="/policies/shipping" className="hover:text-[#2f2f2f] transition-colors">Shipping Info</Link></li>
                        <li><Link to="/policies/returns" className="hover:text-[#2f2f2f] transition-colors">Returns & Exchanges</Link></li>
                        <li><Link to="/policies/privacy" className="hover:text-[#2f2f2f] transition-colors">Privacy Policy</Link></li>
                        <li><Link to="/policies/terms" className="hover:text-[#2f2f2f] transition-colors">Terms & Conditions</Link></li>
                        
                        {/* Dynamic Custom Policies */}
                        {(settings.customPolicies || [])
                            .filter(p => p.isVisible && p.content && p.content.trim() !== "")
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((policy) => (
                                <li key={policy.id || policy.slug}>
                                    <Link to={`/policies/${policy.slug}`} className="hover:text-[#2f2f2f] transition-colors">
                                        {policy.navLabel || policy.title}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <div>
                    <h4 className="font-medium text-[#2f2f2f] text-[11px] uppercase tracking-widest mb-10">Newsletter</h4>
                    <p className="text-xs text-[#6f6f6f] mb-8 italic">Join our community for early access and pet care tips.</p>
                    <form className="flex group" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="bg-transparent border-b border-[#2f2f2f]/30 py-3 flex-grow focus:outline-none focus:border-[#d8b7b1] text-sm placeholder-[#868686] transition-all"
                        />
                        <button className="text-[#2f2f2f] text-[10px] font-medium uppercase tracking-widest ml-6 hover:text-[#d8b7b1] transition-colors">Join</button>
                    </form>
                </div>
            </div>
            <div className="max-w-[1280px] mx-auto px-6 mt-20 pt-12 border-t border-[#2f2f2f]/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-[#868686] font-normal uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span>{settings.footerText || `© 2026 ${settings.shopName}. Crafted with care.`}</span>
                </div>
                <div className="flex space-x-10 mt-8 md:mt-0">
                    <Link to="/moments" className="hover:text-[#2f2f2f] transition-colors tracking-widest">User Gallery</Link>
                    <Link to="/blogs" className="hover:text-[#2f2f2f] transition-colors tracking-widest">Journal</Link>
                </div>
            </div>
            <div className="max-w-[1280px] mx-auto px-6 mt-16 text-center md:text-left">
                <p className="text-[10px] text-brand-charcoal/60 uppercase tracking-widest leading-relaxed">
                    Tutu & Co · Operated by Filter Works (Proprietorship) · GSTIN: 27ABYPW0381K1ZQ
                </p>
                <p className="text-[10px] text-brand-charcoal/60 uppercase tracking-widest leading-relaxed mt-2">
                    Pune, Maharashtra, India
                </p>
            </div>
        </footer>
    );
};

export default Footer;
