import React from 'react';
import { Link } from 'react-router-dom';

import { useShop } from '../context/ShopContext';

const Footer = () => {
    const { settings } = useShop();
    return (
        <footer className="bg-brand-cream border-t border-brand-charcoal/10 py-16 transition-all duration-700">
            <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
                <div className="space-y-8">
                    <h3 className="text-2xl font-medium text-black tracking-tight">{settings.shopName}</h3>
                    <p className="text-brand-charcoal/70 text-sm leading-relaxed italic opacity-80">
                        Curating organic comfort and timeless style for your most beloved companions. Designed in London, enjoyed worldwide.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-brand-charcoal text-[11px] uppercase tracking-[0.2em] mb-10">Shop Collections</h4>
                    <ul className="space-y-4 text-sm text-brand-charcoal/70 font-medium">
                        <li><Link to="/" className="hover:text-brand-rose transition-colors">All Collections</Link></li>
                        <li><Link to="/collab" className="hover:text-brand-rose transition-colors">Collaborations</Link></li>
                        <li><Link to="/sizing" className="hover:text-brand-rose transition-colors">Sizing Guide</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-brand-charcoal text-[11px] uppercase tracking-[0.2em] mb-10">Support & Care</h4>
                    <ul className="space-y-4 text-sm text-brand-charcoal/70 font-medium">
                        <li><Link to="/policy/shipping" className="hover:text-brand-rose transition-colors">Shipping Info</Link></li>
                        <li><Link to="/policy/returns" className="hover:text-brand-rose transition-colors">Returns & Exchanges</Link></li>
                        <li><Link to="/policy/care" className="hover:text-brand-rose transition-colors">Product Care</Link></li>
                        <li><Link to="/policy/privacy" className="hover:text-brand-rose transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-brand-charcoal text-[11px] uppercase tracking-[0.2em] mb-10">Newsletter</h4>
                    <p className="text-xs text-brand-charcoal/60 mb-8 italic">Join our community for early access and pet care tips.</p>
                    <form className="flex group" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Email address"
                            className="bg-transparent border-b border-brand-charcoal/20 py-3 flex-grow focus:outline-none focus:border-brand-rose text-sm placeholder-brand-charcoal/30 transition-all"
                        />
                        <button className="text-brand-charcoal text-[10px] font-bold uppercase tracking-widest ml-6 hover:text-brand-rose transition-colors">Join</button>
                    </form>
                </div>
            </div>
            <div className="max-w-[1280px] mx-auto px-6 mt-20 pt-12 border-t border-brand-charcoal/5 flex flex-col md:flex-row justify-between items-center text-[10px] text-brand-charcoal/40 font-bold uppercase tracking-[0.2em]">
                <span>{settings.footerText || `© 2026 ${settings.shopName}. Crafted with care.`}</span>
                <div className="flex space-x-10 mt-8 md:mt-0">
                    <Link to="/moments" className="hover:text-brand-charcoal transition-colors">User Gallery</Link>
                    <Link to="/blogs" className="hover:text-brand-charcoal transition-colors">Journal</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
