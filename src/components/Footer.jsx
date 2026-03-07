import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[#EADED0] border-t border-[#C7AF94]/30 py-16">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="space-y-4">
                    <h3 className="text-xl font-serif text-black">Tutu & Co</h3>
                    <p className="text-[#95714F] text-sm">
                        Curating organic comfort for your beloved companions.
                    </p>
                </div>
                <div>
                    <h4 className="font-medium text-[#95714F] mb-4">Shop</h4>
                    <ul className="space-y-2 text-sm text-[#95714F]/80">
                        <li><a href="#" className="hover:text-[#95714F]">All Products</a></li>
                        <li><a href="#" className="hover:text-[#95714F]">Bedding</a></li>
                        <li><a href="#" className="hover:text-[#95714F]">Apparel</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-medium text-[#95714F] mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-[#95714F]/80">
                        <li><a href="#" className="hover:text-[#95714F]">Shipping</a></li>
                        <li><a href="#" className="hover:text-[#95714F]">Returns</a></li>
                        <li><a href="#" className="hover:text-[#95714F]">Contact</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-medium text-[#95714F] mb-4">Newsletter</h4>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="bg-transparent border-b border-[#C7AF94] py-2 flex-grow focus:outline-none text-sm"
                        />
                        <button className="text-[#95714F] text-sm font-medium ml-4">Join</button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#C7AF94]/20 text-center text-xs text-[#95714F]/60">
                © 2026 Tutu & Co. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
