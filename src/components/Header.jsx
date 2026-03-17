import React from 'react';
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const Header = () => {
    const { cart } = useShop();
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 bg-[#EADED0]/80 backdrop-blur-md border-b border-[#C7AF94]/30">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Left: Nav Links */}
                <nav className="hidden md:flex items-center space-x-8 text-[#95714F] font-medium uppercase tracking-widest text-[10px]">
                    <Link to="/" className="hover:opacity-70 transition-opacity">Shop</Link>
                    <Link to="/collab" className="hover:opacity-70 transition-opacity">Collab</Link>
                    <Link to="/blogs" className="hover:opacity-70 transition-opacity">Journal</Link>
                </nav>

                {/* Center: Logo */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <Link to="/" className="flex flex-col items-center">
                        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black">
                            <path d="M50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85Z" stroke="currentColor" strokeWidth="4" />
                            <path d="M40 35L30 45M60 35L70 45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <span className="text-xl font-serif tracking-tight text-black mt-1">Tutu & Co</span>
                    </Link>
                </div>

                {/* Right: Icons */}
                <div className="flex items-center space-x-6 text-[#95714F]">
                    <button className="hover:opacity-70 transition-opacity">
                        <Search size={20} />
                    </button>
                    <Link to="/admin/login" className="hover:opacity-70 transition-opacity">
                        <User size={20} />
                    </Link>
                    <Link to="/cart" className="hover:opacity-70 transition-opacity relative">
                        <ShoppingCart size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#8C916C] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <button className="md:hidden hover:opacity-70 transition-opacity">
                        <Menu size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
