import React, { useState, useEffect, useRef } from 'react';
import { 
    LayoutDashboard, Package, ShoppingCart, BarChart3, 
    Settings, LogOut, Search, Filter, Download, 
    TrendingUp, Users, DollarSign, AlertCircle, Eye, Printer, 
    FileText, CheckCircle, Image as ImageIcon, Plus, Trash2, Upload, Edit3
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import mockApi from '../api/mockApi';
import { useShop, getProductImage } from '../context/ShopContext';

const AdminDashboard = () => {
    const { 
        products, banners, media, loading: shopLoading, 
        addProduct, deleteProduct, updateProduct, updateBanners, uploadMedia 
    } = useShop();

    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalCustomers: 0, health: 98 });
    
    // Form States
    const [isEditingProduct, setIsEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', price: 0, stock: 0, category: '', description: '', imageName: '' });
    const fileInputRef = useRef(null);

    const trendData = [
        { name: 'Mon', sales: 4000, orders: 24 },
        { name: 'Tue', sales: 3000, orders: 18 },
        { name: 'Wed', sales: 5000, orders: 29 },
        { name: 'Thu', sales: 2780, orders: 14 },
        { name: 'Fri', sales: 6890, orders: 42 },
        { name: 'Sat', sales: 8390, orders: 51 },
        { name: 'Sun', sales: 4490, orders: 32 },
    ];

    useEffect(() => {
        const loadOrders = async () => {
            const o = await mockApi.getOrders();
            setOrders(o);
            const total = o.reduce((sum, order) => sum + order.total, 0);
            setStats(prev => ({
                ...prev,
                totalSales: total,
                totalOrders: o.length,
                totalCustomers: 142
            }));
            setLoading(false);
        };
        loadOrders();
    }, []);

    if (loading || shopLoading) return <div className="min-h-screen flex items-center justify-center font-serif bg-[#F4F1EA] text-[#3E362E]">Accessing Secured Dashboard...</div>;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            await uploadMedia(reader.result, file.name);
            alert("Image uploaded to Media Library!");
        };
        reader.readAsDataURL(file);
    };

    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center space-x-4 p-4 rounded-sm transition-all ${activeTab === id ? 'bg-[#CD664D] text-white shadow-lg' : 'text-[#3E362E] hover:bg-[#DED6C4]/30'}`}
        >
            <Icon size={20} />
            <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#F4F1EA] flex text-[#3E362E]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-[#CD664D]/10 p-8 flex flex-col pt-32">
                <div className="flex-grow space-y-2">
                    <SidebarItem id="overview" icon={LayoutDashboard} label="Overview" />
                    <SidebarItem id="products" icon={Package} label="Product CMS" />
                    <SidebarItem id="banners" icon={ImageIcon} label="Banner Manager" />
                    <SidebarItem id="media" icon={Upload} label="Media Library" />
                    <SidebarItem id="orders" icon={ShoppingCart} label="Orders" />
                </div>
                <button className="flex items-center space-x-4 p-4 text-red-500 hover:bg-red-50 transition-all rounded-sm">
                    <LogOut size={20} />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-12 pt-32 overflow-y-auto">
                {/* Header */}
                <header className="flex justify-between items-end mb-12 border-b border-[#CD664D]/10 pb-8">
                    <div>
                        <h1 className="text-4xl font-serif text-[#3E362E] mb-2 lowercase italic capitalize">{activeTab.replace('-', ' ')}</h1>
                        <p className="text-[#9FA993] text-sm">System status: All systems operational.</p>
                    </div>
                    <div className="flex space-x-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3E362E]/40" />
                            <input className="bg-white border border-[#CD664D]/10 pl-12 pr-6 py-3 rounded-sm text-sm focus:outline-none focus:border-[#CD664D]" placeholder="Search data..." />
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-12">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Total Sales', val: `$${stats.totalSales.toLocaleString()}`, trend: '+12.5%', icon: DollarSign, color: '#CD664D' },
                                { label: 'Active Orders', val: stats.totalOrders, trend: '+4 today', icon: ShoppingCart, color: '#9FA993' },
                                { label: 'Customers', val: stats.totalCustomers, trend: '+18%', icon: Users, color: '#DED6C4' },
                                { label: 'Site Health', val: `${stats.health}%`, trend: 'Optimal', icon: TrendingUp, color: '#3E362E' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-8 rounded-sm shadow-sm border-b-4" style={{ borderColor: stat.color }}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-[#F4F1EA] rounded-sm text-[#CD664D]"><stat.icon size={24} /></div>
                                        <span className="text-[10px] font-bold text-green-600">{stat.trend}</span>
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993] mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-serif text-[#3E362E]">{stat.val}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="bg-white p-10 rounded-sm shadow-sm border border-[#CD664D]/5">
                            <h2 className="text-xl font-serif text-[#3E362E] mb-8 italic">Revenue Trends (Weekly)</h2>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#CD664D" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#CD664D" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DED6C4" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#3E362E'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#3E362E'}} />
                                        <Tooltip contentStyle={{borderRadius: '0px', border: '1px solid #CD664D'}} />
                                        <Area type="monotone" dataKey="sales" stroke="#CD664D" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-sm shadow-sm border border-[#CD664D]/10">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-serif">Product Catalog</h2>
                                <button 
                                    onClick={() => {
                                        setProductForm({ name: '', price: 0, stock: 0, category: '', description: '', imageName: '' });
                                        setIsEditingProduct('new');
                                    }}
                                    className="bg-[#CD664D] text-white px-6 py-3 rounded-sm flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest"
                                >
                                    <Plus size={16} />
                                    <span>Add New Product</span>
                                </button>
                            </div>
                            
                            <table className="w-full text-left">
                                <thead className="bg-[#F4F1EA]">
                                    <tr className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">
                                        <th className="p-6">Product</th>
                                        <th className="p-6">Stock</th>
                                        <th className="p-6">Price</th>
                                        <th className="p-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F4F1EA]">
                                    {products.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#F4F1EA]/50 transition-colors">
                                            <td className="p-6 flex items-center space-x-4">
                                                <img src={getProductImage(item.imageName, media)} className="w-12 h-12 object-cover rounded-sm border border-[#CD664D]/10" />
                                                <span className="font-serif italic">{item.name}</span>
                                            </td>
                                            <td className="p-6 text-sm">
                                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${item.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {item.stock} units
                                                </span>
                                            </td>
                                            <td className="p-6 font-bold font-serif text-lg">${item.price}</td>
                                            <td className="p-6 text-right space-x-3 text-[#CD664D]">
                                                <button onClick={() => {
                                                    setProductForm(item);
                                                    setIsEditingProduct(item.id);
                                                }}><Edit3 size={18} /></button>
                                                <button onClick={() => deleteProduct(item.id)}><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Edit Modal */}
                        {isEditingProduct && (
                            <div className="fixed inset-0 bg-[#3E362E]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-2xl p-10 rounded-sm shadow-2xl relative">
                                    <h2 className="text-3xl font-serif mb-8 italic">{isEditingProduct === 'new' ? 'New Creation' : 'Refining Identity'}</h2>
                                    <div className="grid grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Name</label>
                                                <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-[#F4F1EA] p-4 font-serif italic border-none focus:ring-1 focus:ring-[#CD664D] outline-none" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Price ($)</label>
                                                    <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full bg-[#F4F1EA] p-4 font-serif italic border-none outline-none" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Stock</label>
                                                    <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full bg-[#F4F1EA] p-4 font-serif italic border-none outline-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Image Identifier (from Media)</label>
                                                <input value={productForm.imageName} onChange={e => setProductForm({...productForm, imageName: e.target.value})} className="w-full bg-[#F4F1EA] p-4 font-serif italic border-none outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Description</label>
                                            <textarea rows={5} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-[#F4F1EA] p-4 font-serif italic border-none outline-none resize-none" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button onClick={() => setIsEditingProduct(null)} className="px-8 py-4 text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Cancel</button>
                                        <button 
                                            onClick={async () => {
                                                if (isEditingProduct === 'new') await addProduct(productForm);
                                                else await updateProduct(isEditingProduct, productForm);
                                                setIsEditingProduct(null);
                                            }}
                                            className="bg-[#CD664D] text-white px-12 py-4 text-[10px] uppercase font-bold tracking-widest"
                                        >
                                            Save Life-change
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'banners' && (
                    <div className="space-y-12">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-serif">Front-Page Identities</h2>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Total Active Banners: {banners.length}</p>
                        </div>
                        
                        {banners.map((banner, index) => (
                            <div key={banner.id} className="bg-white p-10 rounded-sm shadow-sm border border-[#CD664D]/10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Hero Banner {index + 1}</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-[#9FA993] uppercase tracking-tighter">Main Title</label>
                                            <input 
                                                defaultValue={banner.title} 
                                                onBlur={e => {
                                                    const nb = [...banners]; nb[index].title = e.target.value; updateBanners(nb);
                                                }} 
                                                className="w-full text-3xl font-serif italic border-b border-[#CD664D]/20 focus:border-[#CD664D] outline-none bg-transparent py-2" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-[#9FA993] uppercase tracking-tighter">Sub-Narrative</label>
                                            <input 
                                                defaultValue={banner.subtitle} 
                                                onBlur={e => {
                                                    const nb = [...banners]; nb[index].subtitle = e.target.value; updateBanners(nb);
                                                }} 
                                                className="w-full text-[#3E362E]/70 border-b border-[#CD664D]/20 focus:border-[#CD664D] outline-none bg-transparent py-2" 
                                            />
                                        </div>
                                        <div className="flex space-x-6">
                                            <div className="flex-grow">
                                                <label className="text-[10px] font-bold text-[#9FA993] uppercase tracking-tighter">Asset Identifier</label>
                                                <input 
                                                    defaultValue={banner.image} 
                                                    onBlur={e => {
                                                        const nb = [...banners]; nb[index].image = e.target.value; updateBanners(nb);
                                                    }} 
                                                    className="w-full text-sm font-bold border-b border-[#CD664D]/20 outline-none bg-transparent py-2" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-[#9FA993] uppercase tracking-tighter">CTA Label</label>
                                                <input 
                                                    defaultValue={banner.cta} 
                                                    onBlur={e => {
                                                        const nb = [...banners]; nb[index].cta = e.target.value; updateBanners(nb);
                                                    }} 
                                                    className="w-full text-sm font-bold border-b border-[#CD664D]/20 outline-none bg-transparent py-2" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="aspect-[16/7] bg-[#F4F1EA] rounded-sm overflow-hidden relative group shadow-inner">
                                    <img src={getProductImage(banner.image, media)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-[#3E362E]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImageIcon className="text-white drop-shadow-lg" size={48} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <div className="flex justify-center pt-8">
                            <button className="bg-[#3E362E] text-white px-12 py-5 rounded-sm text-[10px] uppercase font-bold tracking-[0.2em] shadow-xl hover:bg-[#CD664D] transition-all">
                                All Configurations Synchronized
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-8">
                        <div className="bg-white p-12 rounded-sm shadow-sm border border-[#CD664D]/10">
                            <div className="border-2 border-dashed border-[#CD664D]/20 rounded-sm p-12 text-center hover:border-[#CD664D]/50 transition-colors cursor-pointer group" onClick={() => fileInputRef.current.click()}>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/jpeg,image/png" />
                                <div className="flex flex-col items-center">
                                    <Upload className="text-[#CD664D] mb-4 group-hover:scale-110 transition-transform" size={48} />
                                    <h3 className="text-xl font-serif italic mb-2 capitalize">Upload New Identity</h3>
                                    <p className="text-[#9FA993] text-sm font-bold tracking-widest uppercase text-[10px]">JPEG or PNG up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {media.map((item) => (
                                <div key={item.id} className="group relative bg-white border border-[#CD664D]/10 rounded-sm overflow-hidden aspect-square">
                                    <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <p className="text-white text-[10px] font-bold uppercase truncate">{item.name}</p>
                                        <button className="text-white mt-2 hover:text-red-400 absolute top-4 right-4"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {/* Placeholders for static shots */}
                            {['IMG_6135', 'IMG_6137', 'IMG_6144', 'IMG_6154', 'IMG_6169', 'IMG_6214'].map(name => (
                                <div key={name} className="group relative bg-white border border-[#CD664D]/10 rounded-sm overflow-hidden aspect-square opacity-50">
                                    <img src={getProductImage(name)} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="bg-white/80 px-2 py-1 text-[8px] font-bold uppercase tracking-widest">Static Asset</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-8 rounded-sm shadow-sm border border-[#CD664D]/10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center space-x-6">
                                    <div className="w-16 h-16 bg-[#CD664D]/10 rounded-full flex items-center justify-center text-[#CD664D]">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-[#3E362E] text-xl">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                        <p className="text-xs text-[#9FA993] uppercase tracking-widest mt-1 font-bold">{order.customerName} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-12">
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-[#9FA993] tracking-widest mb-1">Status</p>
                                        <div className="flex items-center text-green-600 text-[10px] font-bold uppercase tracking-widest">
                                            <CheckCircle size={14} className="mr-2" /> {order.status}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-[#9FA993] tracking-widest mb-1">Impact</p>
                                        <p className="font-serif text-[#3E362E] text-xl font-bold">${order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={() => alert(`Generating Tax Invoice for Order #${order.id}...`)}
                                        className="p-4 bg-[#F4F1EA] text-[#CD664D] hover:bg-[#CD664D] hover:text-white transition-all rounded-sm flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <Printer size={16} />
                                        <span>Invoice</span>
                                    </button>
                                    <button className="p-4 bg-[#3E362E] text-white px-8 rounded-sm text-[10px] uppercase font-bold tracking-widest hover:bg-[#CD664D] transition-colors">Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
