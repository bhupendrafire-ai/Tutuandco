import React, { useState } from 'react';
import {
    LayoutDashboard,
    Image as ImageIcon,
    ShoppingBag,
    Percent,
    Settings,
    LogOut,
    Plus,
    MoreVertical,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const stats = [
        { label: 'Total Sales', value: '$12,450', icon: CheckCircle, color: 'text-green-600' },
        { label: 'Active Discounts', value: '4', icon: Percent, color: 'text-[#95714F]' },
        { label: 'New Orders', value: '18', icon: ShoppingBag, color: 'text-[#8C916C]' },
    ];

    const products = [
        { id: 1, name: 'Organic Cotton Tee', stock: 12, price: '$32.00', status: 'In Stock' },
        { id: 2, name: 'Linen Pet Bandana', stock: 5, price: '$18.00', status: 'Low Stock' },
        { id: 3, name: 'Luxury Pet Bed', stock: 20, price: '$120.00', status: 'In Stock' },
    ];

    const banners = [
        { id: 1, name: 'Main Hero Carousel', status: 'Active', slides: 3 },
        { id: 2, name: 'Seasonal Promo', status: 'Inactive', slides: 1 },
    ];

    return (
        <div className="flex h-screen bg-[#F5F5F3]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#8C916C] text-white flex flex-col">
                <div className="p-8 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <span className="text-[#8C916C] font-bold">TC</span>
                    </div>
                    <span className="text-xl font-serif">Admin</span>
                </div>

                <nav className="flex-grow px-4 mt-6">
                    {[
                        { label: 'Overview', icon: LayoutDashboard },
                        { label: 'Banners', icon: ImageIcon },
                        { label: 'Products', icon: ShoppingBag },
                        { label: 'Discounts', icon: Percent },
                        { label: 'Settings', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeTab === item.label ? 'bg-white/20' : 'hover:bg-white/10'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/10">
                    <button className="flex items-center space-x-3 text-white/70 hover:text-white transition-colors">
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow overflow-y-auto p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-serif text-black">{activeTab}</h1>
                        <p className="text-[#95714F]/60 text-sm mt-1">Management dashboard for Tutu & Co</p>
                    </div>
                    <button className="bg-[#95714F] text-white px-6 py-3 rounded-md flex items-center space-x-2 text-sm font-medium hover:bg-[#8C916C] transition-colors">
                        <Plus size={18} />
                        <span>Add New Item</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-[#C7AF94]/20 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-[#95714F] uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className="text-2xl font-serif text-black">{stat.value}</p>
                            </div>
                            <stat.icon className={stat.color} size={28} />
                        </div>
                    ))}
                </div>

                {/* Dynamic Section Based on Tab */}
                <div className="space-y-8">
                    {/* Banner Management */}
                    <section className="bg-white rounded-xl shadow-sm border border-[#C7AF94]/20 overflow-hidden">
                        <div className="p-6 border-b border-[#F5F5F3] flex justify-between items-center">
                            <h3 className="font-serif text-lg text-black">Website Banners</h3>
                            <button className="text-[#95714F] text-sm font-medium hover:underline">Manage All</button>
                        </div>
                        <div className="divide-y divide-[#F5F5F3]">
                            {banners.map((banner) => (
                                <div key={banner.id} className="p-6 flex items-center justify-between hover:bg-[#F5F5F3]/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-[#EADED0] rounded-lg flex items-center justify-center">
                                            <ImageIcon className="text-[#95714F]" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-black">{banner.name}</p>
                                            <p className="text-xs text-[#95714F]/60">{banner.slides} Slides • Last updated 2 days ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${banner.status === 'Active' ? 'bg-[#8C916C]/10 text-[#8C916C]' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {banner.status}
                                        </span>
                                        <button className="text-[#95714F]/40 hover:text-[#95714F]"><MoreVertical size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Product Management */}
                    <section className="bg-white rounded-xl shadow-sm border border-[#C7AF94]/20 overflow-hidden">
                        <div className="p-6 border-b border-[#F5F5F3] flex justify-between items-center">
                            <h3 className="font-serif text-lg text-black">Current Inventory</h3>
                            <button className="text-[#95714F] text-sm font-medium hover:underline">View Inventory</button>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#F5F5F3]/50 text-xs font-bold text-[#95714F] uppercase tracking-wider">
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5F5F3]">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-[#F5F5F3]/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-black">{product.name}</td>
                                        <td className="px-6 py-4 text-sm text-[#95714F]">{product.stock} units</td>
                                        <td className="px-6 py-4 text-sm font-medium text-black">{product.price}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`flex items-center space-x-1 ${product.status === 'Low Stock' ? 'text-red-500' : 'text-[#8C916C]'
                                                }`}>
                                                {product.status === 'Low Stock' && <AlertCircle size={14} />}
                                                <span>{product.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-[#95714F]/40 hover:text-[#95714F] transition-colors"><MoreVertical size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
