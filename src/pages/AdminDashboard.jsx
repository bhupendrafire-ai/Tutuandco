import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { upload } from '@vercel/blob/client';
import { useShop, getProductImage } from '../context/ShopContext';

// Static constant for Vite replacement
const VITE_API_URL = import.meta.env.VITE_API_URL;
const IS_PROD = import.meta.env.PROD;
const FALLBACK_URL = 'http://localhost:3001';

// Auto-fix protocol OR Auto-detect for the live domain
let resolvedUrl = VITE_API_URL;

if (!resolvedUrl && IS_PROD && typeof window !== 'undefined') {
    const isLiveSite = window.location.hostname === 'www.tutuandco.in' || window.location.hostname === 'tutuandco.in';
    if (isLiveSite) {
        resolvedUrl = 'https://tutuandco-production.up.railway.app';
    }
}

if (resolvedUrl && !resolvedUrl.startsWith('http')) {
    resolvedUrl = `https://${resolvedUrl}`;
}

const FINAL_API_URL = (resolvedUrl || (IS_PROD ? '' : FALLBACK_URL))?.replace(/\/$/, "");

const AdminDashboard = () => {
    const { 
        products, banners, media, loading: shopLoading, 
        addProduct, deleteProduct, updateProduct, updateBanners, uploadMedia 
    } = useShop();

    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalCustomers: 0, health: 98 });
    const { settings, updateSettings } = useShop();
    const [localSettings, setLocalSettings] = useState(settings);
    
    // Form States
    const [isEditingProduct, setIsEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ 
        name: '', price: 0, discountPrice: null, stock: 0, 
        category: '', description: '', imageName: '',
        images: [], descriptionBlocks: [] 
    });
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
            const res = await fetch(`${API_URL}/api/orders`);
            const o = await res.json();
            setOrders(o || []);
            const total = (o || []).reduce((sum, order) => sum + order.total, 0);
            setStats(prev => ({
                ...prev,
                totalSales: total,
                totalOrders: (o || []).length,
                totalCustomers: 142
            }));
            setLoading(false);
        };
        loadOrders();
    }, []);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const saveSettings = async () => {
        await updateSettings(localSettings);
        alert("Universal settings synchronized!");
    };

    if (loading || shopLoading) return <div className="min-h-screen flex items-center justify-center font-serif bg-[#F4F1EA] text-[#3E362E]">Accessing Secured Dashboard...</div>;

    const handleFileUpload = async (e, type = 'media') => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: `${API_URL}/api/upload`,
            });
            
            if (type === 'product_image') {
                const newImg = { url: newBlob.url, name: file.name, isInternal: false, sequence: productForm.images.length };
                setProductForm(prev => ({ ...prev, images: [...prev.images, newImg] }));
            } else {
                await uploadMedia(newBlob.url, file.name);
                alert("Identity uploaded to Vercel Cloud!");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Ensure VITE_BLOB_READ_WRITE_TOKEN is set.");
        }
    };

    const addDescriptionBlock = (type) => {
        const newBlock = type === 'text' 
            ? { type: 'text', title: '', content: '', bullets: [] }
            : { type: 'image', url: '', title: '', content: '' };
        setProductForm(prev => ({ ...prev, descriptionBlocks: [...prev.descriptionBlocks, newBlock] }));
    };

    const updateBlock = (index, updates) => {
        const newBlocks = [...productForm.descriptionBlocks];
        newBlocks[index] = { ...newBlocks[index], ...updates };
        setProductForm(prev => ({ ...prev, descriptionBlocks: newBlocks }));
    };

    const removeBlock = (index) => {
        setProductForm(prev => ({ ...prev, descriptionBlocks: prev.descriptionBlocks.filter((_, i) => i !== index) }));
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
                    <SidebarItem id="settings" icon={Settings} label="Universal Settings" />
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
                                        setProductForm({ 
                                            name: '', price: 0, discountPrice: null, stock: 0, 
                                            category: '', description: '', imageName: '',
                                            images: [], descriptionBlocks: [] 
                                        });
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

                        {/* Premium Listing Workspace Modal */}
                        {isEditingProduct && (
                            <div className="fixed inset-0 bg-[#3E362E]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 md:p-12">
                                <motion.div 
                                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="bg-[#F4F1EA] w-full max-w-7xl h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col"
                                >
                                    {/* Modal Header */}
                                    <div className="bg-white border-b border-[#CD664D]/10 p-8 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-3xl font-serif italic text-[#3E362E]">
                                                {isEditingProduct === 'new' ? 'New Creation' : `Refining: ${productForm.name}`}
                                            </h2>
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993] mt-1">Product ID: {isEditingProduct}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <button onClick={() => setIsEditingProduct(null)} className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest text-[#9FA993] hover:text-[#3E362E]">Discard</button>
                                            <button 
                                                onClick={async () => {
                                                    if (isEditingProduct === 'new') await addProduct(productForm);
                                                    else await updateProduct(isEditingProduct, productForm);
                                                    setIsEditingProduct(null);
                                                }}
                                                className="bg-[#CD664D] text-white px-10 py-4 rounded-sm text-[10px] uppercase font-bold tracking-widest shadow-lg hover:bg-[#3E362E] transition-all"
                                            >
                                                Synchronize Listing
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scrollable Workspace */}
                                    <div className="flex-grow overflow-y-auto p-12 space-y-16">
                                        {/* Row 1: General & Financials */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                            <div className="lg:col-span-2 space-y-8">
                                                <div className="bg-white p-8 rounded-sm shadow-sm border border-[#CD664D]/5">
                                                    <h3 className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#CD664D] mb-6">General Identity</h3>
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-[#9FA993] mb-2 block">Product Name</label>
                                                            <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-[#F4F1EA] p-5 font-serif text-2xl italic border-none focus:ring-1 focus:ring-[#CD664D]" placeholder="Enter name..." />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div>
                                                                <label className="text-[10px] uppercase font-bold text-[#9FA993] mb-2 block">Category</label>
                                                                <input value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-[#F4F1EA] p-4 font-bold border-none" placeholder="e.g. Apparel" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] uppercase font-bold text-[#9FA993] mb-2 block">Main Image Slug</label>
                                                                <input value={productForm.imageName} onChange={e => setProductForm({...productForm, imageName: e.target.value})} className="w-full bg-[#F4F1EA] p-4 border-none" placeholder="e.g. IMG_6135" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] uppercase font-bold text-[#9FA993] mb-2 block">Brief Hook (SEO Description)</label>
                                                            <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-[#F4F1EA] p-5 font-serif border-none resize-none" placeholder="Catchy summary..." />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="bg-white p-8 rounded-sm shadow-sm border border-[#CD664D]/5 h-full">
                                                    <h3 className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#CD664D] mb-6">Financial Controls</h3>
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-4 bg-[#F4F1EA] rounded-sm">
                                                                <label className="text-[9px] uppercase font-bold text-[#9FA993] block mb-1">Base Price ({settings.currency?.symbol})</label>
                                                                <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full bg-transparent text-2xl font-serif font-bold p-0 border-none outline-none" />
                                                            </div>
                                                            <div className="p-4 bg-[#CD664D]/5 rounded-sm border border-[#CD664D]/10">
                                                                <label className="text-[9px] uppercase font-bold text-[#CD664D] block mb-1">Discount Price</label>
                                                                <input type="number" value={productForm.discountPrice || ''} onChange={e => setProductForm({...productForm, discountPrice: e.target.value ? parseFloat(e.target.value) : null})} className="w-full bg-transparent text-2xl font-serif font-bold p-0 border-none outline-none text-[#CD664D]" placeholder="None" />
                                                            </div>
                                                        </div>
                                                        <div className="p-4 bg-[#F4F1EA] rounded-sm">
                                                            <label className="text-[9px] uppercase font-bold text-[#9FA993] block mb-1">Available Stock</label>
                                                            <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full bg-transparent text-xl font-bold p-0 border-none outline-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Image Lounge */}
                                        <div className="bg-white p-10 rounded-sm shadow-sm border border-[#CD664D]/5">
                                            <div className="flex justify-between items-center mb-10">
                                                <h3 className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#CD664D]">Image Lounge & Sequencing</h3>
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex items-center space-x-2 text-[10px] uppercase font-bold text-[#CD664D] border-b border-[#CD664D] pb-1"
                                                >
                                                    <Plus size={14} /> <span>Add Fresh Angle</span>
                                                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'product_image')} />
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                                {productForm.images?.sort((a,b) => a.sequence - b.sequence).map((img, idx) => (
                                                    <div key={idx} className="group relative aspect-[3/4] bg-[#F4F1EA] rounded-sm overflow-hidden border border-[#CD664D]/10">
                                                        <img src={getProductImage(img.url, media)} className="w-full h-full object-cover" />
                                                        <div className="absolute top-2 left-2 bg-[#CD664D] text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-lg">#{img.sequence}</div>
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                                            <div className="flex justify-between">
                                                                <button onClick={() => {
                                                                    const newer = [...productForm.images];
                                                                    newer[idx].isInternal = !newer[idx].isInternal;
                                                                    setProductForm({...productForm, images: newer});
                                                                }} className={`text-[8px] font-bold uppercase ${img.isInternal ? 'text-yellow-400' : 'text-green-400'}`}>
                                                                    {img.isInternal ? 'Internal' : 'Public'}
                                                                </button>
                                                                <button onClick={() => {
                                                                    setProductForm({...productForm, images: productForm.images.filter((_, i) => i !== idx)});
                                                                }} className="text-white hover:text-red-500"><Trash2 size={14} /></button>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <button onClick={() => {
                                                                    if (img.sequence <= 0) return;
                                                                    const newer = [...productForm.images];
                                                                    newer[idx].sequence--;
                                                                    setProductForm({...productForm, images: newer});
                                                                }} className="flex-1 bg-white/20 hover:bg-white/40 text-white rounded p-1 text-[8px] uppercase font-bold">Up</button>
                                                                <button onClick={() => {
                                                                    const newer = [...productForm.images];
                                                                    newer[idx].sequence++;
                                                                    setProductForm({...productForm, images: newer});
                                                                }} className="flex-1 bg-white/20 hover:bg-white/40 text-white rounded p-1 text-[8px] uppercase font-bold">Down</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Row 3: Story Builder (Descriptions) */}
                                        <div className="bg-[#3E362E] p-12 rounded-sm text-white">
                                            <div className="flex justify-between items-center mb-12">
                                                <div>
                                                    <h3 className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#CD664D]">Story Builder</h3>
                                                    <p className="text-xs opacity-40 mt-1">Add rich detail blocks to create a luxury product narrative.</p>
                                                </div>
                                                <div className="flex space-x-4">
                                                    <button onClick={() => addDescriptionBlock('text')} className="flex items-center space-x-2 text-[10px] uppercase font-bold bg-white/10 hover:bg-white/20 px-6 py-3 rounded-sm transition-all border border-white/10">
                                                        <FileText size={14} /> <span>+ Text Block</span>
                                                    </button>
                                                    <button onClick={() => addDescriptionBlock('image')} className="flex items-center space-x-2 text-[10px] uppercase font-bold bg-[#CD664D] hover:bg-[#CD664D]/80 px-6 py-3 rounded-sm transition-all shadow-lg">
                                                        <ImageIcon size={14} /> <span>+ Image + Text</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                {productForm.descriptionBlocks?.map((block, idx) => (
                                                    <motion.div 
                                                        layout
                                                        key={idx} 
                                                        className="bg-white/5 border border-white/10 p-8 rounded-sm relative group"
                                                    >
                                                        <button onClick={() => removeBlock(idx)} className="absolute top-4 right-4 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                                                        
                                                        <div className="flex gap-8">
                                                            {block.type === 'image' && (
                                                                <div className="w-48 aspect-square bg-black/20 rounded-sm overflow-hidden flex flex-col items-center justify-center border border-white/5 relative">
                                                                    {block.url ? (
                                                                        <img src={getProductImage(block.url, media)} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="text-center p-4">
                                                                            <ImageIcon size={24} className="mx-auto mb-2 opacity-20" />
                                                                            <span className="text-[8px] uppercase block opacity-40">Paste Slug</span>
                                                                        </div>
                                                                    )}
                                                                    <input 
                                                                        value={block.url} 
                                                                        onChange={e => updateBlock(idx, { url: e.target.value })}
                                                                        className="absolute bottom-0 w-full bg-black/60 text-white text-[8px] p-2 border-none outline-none focus:bg-black/90" 
                                                                        placeholder="Image Slug..." 
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-grow space-y-4 text-white">
                                                                <input 
                                                                    value={block.title} 
                                                                    onChange={e => updateBlock(idx, { title: e.target.value })}
                                                                    className="bg-transparent text-2xl font-serif italic border-none outline-none w-full placeholder:opacity-20" 
                                                                    placeholder="Block Title (Heading)..." 
                                                                />
                                                                <textarea 
                                                                    rows={3}
                                                                    value={block.content} 
                                                                    onChange={e => updateBlock(idx, { content: e.target.value })}
                                                                    className="bg-transparent text-sm opacity-70 w-full border-none outline-none resize-none placeholder:opacity-20" 
                                                                    placeholder="Describe the detail or moment..." 
                                                                />
                                                                {block.type === 'text' && (
                                                                    <div>
                                                                        <label className="text-[8px] uppercase font-bold opacity-40 mb-2 block">Bullet Points (comma separated)</label>
                                                                        <input 
                                                                            value={block.bullets?.join(', ')} 
                                                                            onChange={e => updateBlock(idx, { bullets: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                                                            className="w-full bg-white/5 p-4 text-xs font-serif border-none outline-none" 
                                                                            placeholder="Organic Cotton, Hand-Stitched, Eco-Friendly..." 
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
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

                {activeTab === 'settings' && (
                    <div className="max-w-4xl space-y-12">
                        <div className="bg-white p-12 rounded-sm shadow-sm border border-[#CD664D]/10">
                            <h2 className="text-2xl font-serif mb-10 italic">Global Shop Identity</h2>
                            <div className="grid grid-cols-2 gap-10 mb-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#9FA993]">Shop Name</label>
                                    <input 
                                        value={localSettings.shopName} 
                                        onChange={e => setLocalSettings({...localSettings, shopName: e.target.value})}
                                        className="w-full bg-[#F4F1EA] p-5 font-serif text-xl italic border-none outline-none focus:ring-1 focus:ring-[#CD664D]" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#9FA993]">Contact Email</label>
                                    <input 
                                        value={localSettings.contactEmail} 
                                        onChange={e => setLocalSettings({...localSettings, contactEmail: e.target.value})}
                                        className="w-full bg-[#F4F1EA] p-5 font-serif text-lg border-none outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 mb-10">
                                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#9FA993]">Footer Text</label>
                                <textarea 
                                    rows={2}
                                    value={localSettings.footerText} 
                                    onChange={e => setLocalSettings({...localSettings, footerText: e.target.value})}
                                    className="w-full bg-[#F4F1EA] p-5 font-serif text-sm border-none outline-none resize-none" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-10 rounded-sm border border-[#CD664D]/10">
                                <h3 className="text-lg font-serif mb-6 flex items-center"><DollarSign className="mr-3" size={20} /> Financials</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-[#9FA993]">Currency Symbol</label>
                                            <input 
                                                value={localSettings.currency?.symbol} 
                                                onChange={e => setLocalSettings({...localSettings, currency: {...localSettings.currency, symbol: e.target.value}})}
                                                className="w-full bg-[#F4F1EA] p-4 text-center text-xl font-bold border-none outline-none" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-[#9FA993]">Currency Code</label>
                                            <input 
                                                value={localSettings.currency?.code} 
                                                onChange={e => setLocalSettings({...localSettings, currency: {...localSettings.currency, code: e.target.value.toUpperCase()}})}
                                                className="w-full bg-[#F4F1EA] p-4 text-center font-bold border-none outline-none uppercase" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">Global Discount (%)</label>
                                        <input 
                                            type="number"
                                            value={localSettings.globalDiscount} 
                                            onChange={e => setLocalSettings({...localSettings, globalDiscount: parseFloat(e.target.value)})}
                                            className="w-full bg-[#F4F1EA] p-4 font-bold border-none outline-none" 
                                        />
                                        <p className="text-[9px] text-[#CD664D] italic mt-1">* applies to all products globally in the cart</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#3E362E] p-10 rounded-sm text-white flex flex-col justify-center items-center">
                                <Settings size={48} className="mb-6 opacity-40 animate-spin-slow" />
                                <h3 className="text-xl font-serif mb-4 italic">Synchronize Cloud</h3>
                                <p className="text-center text-[10px] uppercase tracking-[0.2em] font-bold opacity-60 mb-8">Deploy your universal configurations instantly</p>
                                <button 
                                    onClick={saveSettings}
                                    className="bg-white text-black px-12 py-4 rounded-sm text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-[#CD664D] hover:text-white transition-all shadow-xl"
                                >
                                    Push Global Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
