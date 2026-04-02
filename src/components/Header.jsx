import React from 'react';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

import logo from '../assets/logo.png';

const Header = () => {
    const { cart } = useShop();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 bg-brand-sage/80 backdrop-blur-md border-b border-brand-charcoal/10">
            <div className="max-w-[1440px] mx-auto px-4 h-20 flex items-center justify-between">
                {/* Left: Nav Links (Desktop) or Menu (Mobile) */}
                <div className="flex-1 flex items-center">
                    <nav className="hidden md:flex items-center space-x-8 text-brand-charcoal font-medium text-sm">
                        <Link to="/" className="hover:opacity-70 transition-opacity">Shop</Link>
                        <Link to="/collab" className="hover:opacity-70 transition-opacity">Collab</Link>
                        <Link to="/blogs" className="hover:opacity-70 transition-opacity">Journal</Link>
                    </nav>
                    <button className="md:hidden hover:opacity-70 transition-opacity">
                        <Menu size={20} />
                    </button>
                </div>

                {/* Center: Logo */}
                <div className="flex-shrink-0">
                    <Link to="/" className="flex flex-col items-center">
                        <img src={logo} alt="Tutu & Co" className="h-8 md:h-12 w-auto object-contain" />
                    </Link>
                </div>

                {/* Right: Icons */}
                <div className="flex-1 flex items-center justify-end space-x-4 md:space-x-6 text-brand-charcoal">
                    <button className="hover:opacity-70 transition-opacity">
                        <Search size={20} />
                    </button>
                    <Link to="/admin/login" className="hidden sm:block hover:opacity-70 transition-opacity">
                        <User size={20} />
                    </Link>
                    <Link to="/cart" className="hover:opacity-70 transition-opacity relative">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-brand-charcoal text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
