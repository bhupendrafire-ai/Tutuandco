import React, { useState } from 'react';
import { useNavigate, useParams, Link, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Package, ShoppingCart, Settings, 
    LogOut, X, Menu, Image as ImageIcon
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import logo from '../assets/logo.png';

// Import sub-pages
import AdminOverview from './admin/AdminOverview';
import AdminProducts from './admin/AdminProducts';
import AdminBanners from './admin/AdminBanners';
import AdminMedia from './admin/AdminMedia';
import AdminOrders from './admin/AdminOrders';
import AdminSettings from './admin/AdminSettings';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loading: shopLoading } = useShop();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (shopLoading) return <div className="min-h-screen flex items-center justify-center font-medium bg-brand-sage text-brand-charcoal">Accessing secured dashboard...</div>;

    // Helper to get active label from path
    const getActiveLabel = () => {
        const path = location.pathname.split('/').pop();
        switch(path) {
            case 'products': return 'Products';
            case 'banners': return 'Hero Banners';
            case 'media': return 'Media Library';
            case 'orders': return 'Customer Orders';
            case 'settings': return 'Store Settings';
            default: return 'Overview';
        }
    };

    const SidebarItem = ({ icon: Icon, label, to }) => (
        <NavLink 
            to={to}
            end={to === '/admin/dashboard'}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `
                w-full flex items-center space-x-4 p-4 rounded-sm transition-all duration-300
                ${isActive 
                    ? 'bg-brand-charcoal text-white shadow-lg scale-[1.02]' 
                    : 'text-brand-charcoal/60 hover:bg-white/40'
                }
            `}
        >
            {Icon}
            <span className="text-[13px] font-bold tracking-wide">{label}</span>
        </NavLink>
    );

    return (
        <div className="min-h-screen bg-brand-sage flex text-brand-charcoal relative">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-brand-cream border-b border-brand-charcoal/10 z-50 flex items-center justify-between px-6">
                <img src={logo} alt="Tutu & Co" className="h-10 w-auto" />
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-brand-charcoal">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-[#B4BFA8] border-r border-brand-charcoal/5 p-8 flex flex-col pt-32 lg:pt-32 z-[60] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 shadow-2xl lg:shadow-none'}`}>
                <div className="flex-grow space-y-2">
                    <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
                    <SidebarItem to="/admin/dashboard/products" icon={<Package size={20} />} label="Products" />
                    <SidebarItem to="/admin/dashboard/banners" icon={<ImageIcon size={20} />} label="Hero Banners" />
                    <SidebarItem to="/admin/dashboard/media" icon={<ImageIcon size={20} />} label="Media Library" />
                    <SidebarItem to="/admin/dashboard/orders" icon={<ShoppingCart size={20} />} label="Customer Orders" />
                    <SidebarItem to="/admin/dashboard/settings" icon={<Settings size={20} />} label="Store Settings" />
                </div>
                <button 
                    onClick={() => {
                        sessionStorage.removeItem('isAdminAuthenticated');
                        navigate('/admin/login');
                    }}
                    className="flex items-center space-x-4 p-4 text-red-500 hover:bg-red-50 transition-all rounded-sm mt-auto"
                >
                    <LogOut size={20} />
                    <span className="text-[13px] font-bold">Logout</span>
                </button>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]" 
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-grow p-6 lg:p-12 pt-28 lg:pt-32 overflow-x-hidden">
                <header className="flex justify-between items-end mb-12 border-b border-brand-charcoal/10 pb-8">
                    <div>
                        <h1 className="text-4xl font-medium text-brand-charcoal mb-2 capitalize">{getActiveLabel()}</h1>
                        <p className="text-brand-charcoal/80 text-sm font-bold">System status: <span className="text-brand-rose">Connected & Calibrating.</span></p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <h2 className="text-2xl font-medium text-brand-charcoal capitalize">{getActiveLabel()}</h2>
                            <p className="text-[10px] font-medium text-brand-charcoal/40 uppercase tracking-widest">
                                Online Store Environment
                            </p>
                        </div>
                    </div>
                </header>

                <Routes>
                    <Route index element={<AdminOverview />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;
