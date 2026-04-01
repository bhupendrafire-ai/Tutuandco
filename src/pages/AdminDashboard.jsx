import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Package, ShoppingCart, BarChart3, 
    Settings, LogOut, Search, Filter, Download, 
    TrendingUp, Users, DollarSign, AlertCircle, Eye, Printer, 
    FileText, CheckCircle, Image as ImageIcon, Plus, Trash2, Upload, Edit3, Menu, X, Layout, RefreshCcw, ChevronDown, Check, CheckCircle2,
    Maximize, Minimize, Cloud
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { upload } from '@vercel/blob/client';
import { useShop, getProductImage, FINAL_API_URL } from '../context/ShopContext';
import MediaPicker from '../components/MediaPicker';
import mockApi from '../api/mockApi';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { '*': dashPath } = useParams();
    const activeTab = dashPath?.split('/').filter(Boolean)[0] || 'overview';
    const { 
        products, banners, media, loading: shopLoading, 
        addProduct, deleteProduct, updateProduct, updateBanners, uploadMedia 
    } = useShop();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalCustomers: 0, health: 98 });
    const { settings, updateSettings } = useShop();
    const [localSettings, setLocalSettings] = useState(settings);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Form States
    const [isEditingProduct, setIsEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ 
        name: '', price: 0, discountPrice: null, stock: 0, 
        category: '', description: '', imageName: '',
        images: [], descriptionBlocks: [] 
    });
    const [mediaPickerConfig, setMediaPickerConfig] = useState({ isOpen: false, multi: false, onSelect: () => {}, selectedItems: [] });
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCatTemp, setNewCatTemp] = useState('');
    const [sessionCategories, setSessionCategories] = useState([]);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);
    const [adjustingImageIdx, setAdjustingImageIdx] = useState(null);


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
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRenameCategory = async (oldName, newName) => {
        if (!newName || newName === oldName) return;
        const updatedCats = (localSettings.categories || []).map(c => c === oldName ? newName : c);
        const nextSettings = { ...localSettings, categories: updatedCats };
        setLocalSettings(nextSettings);
        
        // Batch update products locally and on server
        const affected = products.filter(p => p.category === oldName);
        for (const p of affected) {
            await updateProduct(p.id, { ...p, category: newName });
        }

        // Auto-update form if it's currently using the old name
        if (productForm.category === oldName) {
            setProductForm(prev => ({ ...prev, category: newName }));
        }
    };

    const handleDeleteCategory = (catName) => {
        if (window.confirm(`Remove "${catName}" from master list? Products in this category will remain but the category will be removed from selection pools.`)) {
            const updatedCats = (localSettings.categories || []).filter(c => c !== catName);
            setLocalSettings({ ...localSettings, categories: updatedCats });
            if (productForm.category === catName) setProductForm({ ...productForm, category: '' });
        }
    };

    useEffect(() => {
        const loadOrders = async () => {
            const res = await fetch(`${FINAL_API_URL}/api/orders`);
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

    if (loading || shopLoading) return <div className="min-h-screen flex items-center justify-center font-medium bg-brand-sage text-brand-charcoal">Accessing secured dashboard...</div>;

    const handleFileUpload = async (e, type = 'media') => {
        let file = e.target.files[0];
        if (!file) return;

        // HEIC Support: Convert to JPEG on the fly
        const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
        if (isHEIC) {
            try {
                // Dynamically load conversion library from CDN
                const heic2any = (await import('https://esm.sh/heic2any')).default;
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });
                // Create a new File object from the blob
                file = new File([convertedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
            } catch (err) {
                console.error("HEIC conversion failed", err);
                alert("Could not process this iPhone photo. Please try a different format.");
                return;
            }
        }
        
        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: `${FINAL_API_URL}/api/upload`,
            });
            
            if (type === 'product_image') {
                const newImg = { 
                    url: newBlob.url, 
                    name: file.name, 
                    isInternal: false, 
                    sequence: productForm.images.length,
                    fitMode: 'cover',
                    focalPoint: { x: 50, y: 50 }
                };
                setProductForm(prev => ({ ...prev, images: [...prev.images, newImg] }));
            } else {
                await uploadMedia(newBlob.url, file.name);
                alert("Identity uploaded to Vercel Cloud!");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message || "Unknown error"}. Check server logs and environment variables (BLOB_READ_WRITE_TOKEN).`);
        }
    };

    const addDescriptionBlock = (type, template = null) => {
        let newBlock = { type, id: Date.now() };
        
        if (template === 'wide_banner') {
            newBlock = { ...newBlock, template, title: '', url: '', content: '' };
        } else if (template === 'grid_spotlight') {
            newBlock = { ...newBlock, template, items: Array(4).fill(0).map(() => ({ url: '', title: '', bullets: ['', '', ''] })) };
        } else if (template === 'overlay_feature') {
            newBlock = { ...newBlock, template, title: '', url: '', content: '' };
        } else if (template === 'alternating_items') {
            newBlock = { ...newBlock, template, items: Array(4).fill(0).map(() => ({ url: '', title: '', content: '' })) };
        } else {
            newBlock = type === 'text' 
                ? { ...newBlock, title: '', content: '', bullets: [] }
                : { ...newBlock, type: 'image', url: '', title: '', content: '' };
        }
        
        setProductForm(prev => ({ ...prev, descriptionBlocks: [...(prev.descriptionBlocks || []), newBlock] }));
    };


    const updateBlock = (index, updates) => {
        const newBlocks = [...productForm.descriptionBlocks];
        newBlocks[index] = { ...newBlocks[index], ...updates };
        setProductForm(prev => ({ ...prev, descriptionBlocks: newBlocks }));
    };

    const removeBlock = (index) => {
        setProductForm(prev => ({ ...prev, descriptionBlocks: prev.descriptionBlocks.filter((_, i) => i !== index) }));
    };

    const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
        <button 
            onClick={onClick}
            className={`w-full flex items-center space-x-4 p-4 rounded-sm transition-all duration-300 ${
                active 
                    ? 'bg-brand-charcoal text-white shadow-lg scale-[1.02]' 
                    : 'text-brand-charcoal/60 hover:bg-white/40'
            }`}
        >
            <Icon size={20} />
            <span className="text-[13px] font-bold tracking-wide">{label}</span>
        </button>
    );

    const openMediaPicker = (config) => {
        setMediaPickerConfig({ ...config, isOpen: true });
    };


    return (
        <div className="min-h-screen bg-brand-sage flex text-brand-charcoal relative">
            {/* Mobile Toolbar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-brand-cream border-b border-brand-charcoal/10 z-50 flex items-center justify-between px-6">
                <img src={logo} alt="Tutu & Co" className="h-10 w-auto" />
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-brand-charcoal">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-[#B4BFA8] border-r border-brand-charcoal/5 p-8 flex flex-col pt-32 lg:pt-32 z-[60] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 shadow-2xl lg:shadow-none'}`}>
                <div className="flex-grow space-y-2">
                        <SidebarItem 
                            icon={LayoutDashboard} label="Overview" 
                            active={activeTab === 'overview'} 
                            onClick={() => { navigate('/admin/dashboard/overview'); setIsSidebarOpen(false); }} 
                        />
                        <SidebarItem 
                            icon={Package} label="Product CMS" 
                            active={activeTab === 'products'} 
                            onClick={() => { navigate('/admin/dashboard/products'); setIsSidebarOpen(false); }} 
                        />
                        <SidebarItem 
                            icon={ImageIcon} label="Banner Manager" 
                            active={activeTab === 'banners'} 
                            onClick={() => { navigate('/admin/dashboard/banners'); setIsSidebarOpen(false); }} 
                        />
                        <SidebarItem 
                            icon={Upload} label="Media Library" 
                            active={activeTab === 'media'} 
                            onClick={() => { navigate('/admin/dashboard/media'); setIsSidebarOpen(false); }} 
                        />
                        <SidebarItem 
                            icon={ShoppingCart} label="Orders" 
                            active={activeTab === 'orders'} 
                            onClick={() => { navigate('/admin/dashboard/orders'); setIsSidebarOpen(false); }} 
                        />
                        <SidebarItem 
                            icon={Settings} label="Universal Settings" 
                            active={activeTab === 'settings'} 
                            onClick={() => { navigate('/admin/dashboard/settings'); setIsSidebarOpen(false); }} 
                        />
                </div>
                <button 
                    onClick={() => {
                        sessionStorage.removeItem('isAdminAuthenticated');
                        navigate('/admin/login');
                    }}
                    className="flex items-center space-x-4 p-4 text-red-500 hover:bg-red-50 transition-all rounded-sm"
                >
                    <LogOut size={20} />
                    <span className="text-[13px] font-bold">Logout</span>
                </button>
            </aside>

            {/* Sidebar Overlay for Mobile */}
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

                {/* Header */}
                <header className="flex justify-between items-end mb-12 border-b border-brand-charcoal/10 pb-8">
                    <div>
                        <h1 className="text-4xl font-medium text-brand-charcoal mb-2 capitalize">{activeTab.replace('-', ' ')}</h1>
                        <p className="text-brand-charcoal/80 text-sm font-bold">System status: All systems operational.</p>
                    </div>
                    <div className="flex space-x-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/60" />
                            <input className="bg-brand-cream border border-brand-charcoal/20 pl-12 pr-6 py-3 rounded-sm text-sm focus:outline-none focus:border-brand-charcoal placeholder-brand-charcoal/50 font-medium" placeholder="Search data..." />
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
                                <div key={i} className="bg-brand-cream p-8 rounded-sm shadow-sm border-b-4" style={{ borderColor: stat.color === '#CD664D' ? '#3B3B3B' : (stat.color === '#9FA993' ? '#8C916C' : stat.color) }}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-brand-sage/50 rounded-sm text-brand-charcoal"><stat.icon size={24} /></div>
                                        <span className="text-[12px] font-bold text-green-700">{stat.trend}</span>
                                    </div>
                                    <p className="text-[13px] font-bold text-brand-charcoal/60 mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-medium text-brand-charcoal">{stat.val}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <h2 className="text-xl font-medium text-brand-charcoal mb-8">Revenue trends (weekly)</h2>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#CD664D" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#CD664D" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#3B3B3B'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#3B3B3B'}} />
                                        <Tooltip contentStyle={{borderRadius: '0px', border: '1px solid #3B3B3B'}} />
                                        <Area type="monotone" dataKey="sales" stroke="#3B3B3B" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-medium">Product catalog</h2>
                                <button 
                                    onClick={() => {
                                        setShowNewCategoryInput(false);
                                        setProductForm({ 
                                            name: '', price: 0, discountPrice: null, stock: 0, 
                                            category: '', description: '', imageName: '',
                                            images: [], descriptionBlocks: [] 
                                        });
                                        setIsEditingProduct('new');
                                    }}
                                    className="bg-brand-rose text-brand-charcoal px-6 py-3 rounded-sm flex items-center space-x-2 text-[11px] font-medium shadow-lg hover:opacity-80 transition-all"
                                >
                                    <Plus size={16} />
                                    <span>Add new product</span>
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto -mx-8 px-8">
                                <table className="w-full text-left min-w-[600px]">
                                    <thead className="bg-brand-cream">
                                        <tr className="text-[13px] font-bold text-brand-charcoal/60">
                                            <th className="p-6">Product</th>
                                            <th className="p-6">Stock</th>
                                            <th className="p-6">Price</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F4F1EA]">
                                        {products.map((item) => (
                                            <tr key={item.id} className="hover:bg-[#F4F1EA]/50 transition-colors">
                                                <td className="p-6 flex items-center space-x-6">
                                                    <img src={getProductImage(item.images?.[0]?.url || item.imageName, media)} className="w-24 h-24 object-cover rounded-sm border border-brand-charcoal/10 shadow-sm" />
                                                    <span className="font-bold text-lg md:text-xl line-clamp-1">{item.name}</span>
                                                </td>
                                                <td className="p-6 text-sm">
                                                    <span className={`px-4 py-1.5 text-[12px] font-bold rounded-full ${item.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {item.stock} units
                                                    </span>
                                                </td>
                                                <td className="p-6 font-medium text-lg">₹{item.price}</td>
                                                <td className="p-6 text-right space-x-3 text-[#CD664D]">
                                                    <button onClick={() => {
                                                        setShowNewCategoryInput(false);
                                                        setProductForm(item);
                                                        setIsEditingProduct(item.id);
                                                    }}><Edit3 size={18} /></button>
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
                                                                deleteProduct(item.id);
                                                            }
                                                        }}
                                                        className="hover:text-red-500 transition-colors"
                                                        title="Delete Listing"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                        {/* Premium Listing Workspace Modal */}
                        {isEditingProduct && (
                            <div 
                                className="fixed inset-0 bg-[#3E362E]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 md:p-12 cursor-pointer"
                                onClick={() => setIsEditingProduct(null)}
                            >
                                <motion.div 
                                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="bg-[#F4F1EA] w-full max-w-7xl h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col cursor-default relative"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Isolated Close Button */}
                                    <button 
                                        onClick={() => setIsEditingProduct(null)} 
                                        className="absolute top-4 right-4 p-2 bg-brand-charcoal text-white rounded-full hover:bg-black transition-all shadow-xl z-[200]"
                                        title="Close Workspace"
                                    >
                                        <X size={16} />
                                    </button>

                                    {/* Modal Header */}
                                    <div className="bg-[#F4F1EA] border-b border-[#CD664D]/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-medium text-brand-charcoal">
                                                {isEditingProduct === 'new' ? 'New creation' : `Refining: ${productForm.name}`}
                                            </h2>
                                            <p className="text-[12px] font-bold text-brand-charcoal/60 mt-1">Product ID: {isEditingProduct}</p>
                                        </div>
                                        <div className="invisible lg:visible opacity-10">
                                            {/* Top-right spacing for Close (X) isolation */}
                                        </div>
                                    </div>

                                    {/* Scrollable Workspace Body */}
                                    <div className="flex-grow overflow-y-auto flex flex-col md:flex-row custom-scrollbar">
                                        
                                        {/* Column 1: Media Hub */}
                                        <div className="w-full md:w-[40%] bg-[#F4F1EA]/60 border-r border-brand-charcoal/5 flex flex-col p-6 md:p-10 overflow-hidden">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-[12px] font-bold text-brand-charcoal/70 uppercase tracking-widest">Media Hub</h3>
                                                <div className="flex gap-4">
                                                    <button onClick={() => openMediaPicker({
                                                        multi: true,
                                                        selectedItems: productForm.images?.map(img => img.url) || [],
                                                        onSelect: (urls) => {
                                                            const newImages = urls.map((url, index) => {
                                                                const existing = productForm.images?.find(img => img.url === url);
                                                                return existing || { 
                                                                    url, 
                                                                    name: 'Gallery Image', 
                                                                    isInternal: false, 
                                                                    sequence: index,
                                                                    fitMode: 'cover',
                                                                    focalPoint: { x: 50, y: 50 }
                                                                };
                                                            }).slice(0, 4);
                                                            setProductForm({ ...productForm, images: newImages });
                                                        }
                                                    })} className="text-[10px] font-medium text-brand-charcoal/60 hover:text-brand-rose transition-colors flex items-center gap-1">
                                                        <ImageIcon size={14} /> Library
                                                    </button>
                                                    <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-medium text-brand-charcoal/60 hover:text-brand-rose transition-colors flex items-center gap-1">
                                                        <Plus size={14} /> Fresh
                                                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'product_image')} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-1 overflow-hidden mb-6">
                                                {[0, 1, 2, 3].map((idx) => (
                                                    <div 
                                                        key={idx}
                                                        onClick={() => !productForm.images?.[idx] && openMediaPicker({
                                                            multi: false,
                                                            onSelect: (url) => {
                                                                const newer = [...(productForm.images || [])];
                                                                for(let i=0; i<idx; i++) if(!newer[i]) newer[i] = { url: '', fitMode: 'cover', focalPoint: {x:50,y:50} }; 
                                                                newer[idx] = { url, name: idx === 0 ? 'Hero Asset' : `Detail ${idx}`, isInternal: false, sequence: idx, fitMode: 'cover', focalPoint: { x: 50, y: 50 } };
                                                                setProductForm({...productForm, images: newer.filter(img => img.url)});
                                                            }
                                                        })}
                                                        className={`relative rounded-sm border border-brand-charcoal/10 overflow-hidden group shadow-sm transition-all duration-300 ${!productForm.images?.[idx] ? 'cursor-pointer hover:border-brand-rose/40 hover:bg-white bg-white/50' : 'bg-brand-cream/10'}`}
                                                    >
                                                        {productForm.images?.[idx] ? (
                                                            <>
                                                                <img 
                                                                    src={getProductImage(productForm.images[idx].url, media)} 
                                                                    className="w-full h-full pointer-events-none"
                                                                    style={{ 
                                                                        objectFit: productForm.images[idx].fitMode || 'cover',
                                                                        objectPosition: `${productForm.images[idx].focalPoint?.x || 50}% ${productForm.images[idx].focalPoint?.y || 50}%`
                                                                    }}
                                                                />
                                                                <div className="absolute bottom-3 left-3 bg-brand-charcoal/80 text-white text-[8px] font-medium px-2.5 py-1 rounded-full shadow-lg z-10 transition-opacity group-hover:opacity-20 uppercase tracking-widest">
                                                                    {idx === 0 ? 'Primary Hero' : `Detail Asset 0${idx+1}`}
                                                                </div>
                                                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setAdjustingImageIdx(adjustingImageIdx === idx ? null : idx);
                                                                            }}
                                                                            className={`flex items-center gap-1.5 font-medium text-[9px] px-2 py-1.5 rounded-sm shadow-xl transition-all ${adjustingImageIdx === idx ? 'bg-brand-rose text-brand-charcoal' : 'bg-white text-brand-charcoal hover:bg-brand-cream'}`}
                                                                        >
                                                                            <RefreshCcw size={10} className={adjustingImageIdx === idx ? 'animate-spin' : ''} /> {adjustingImageIdx === idx ? 'Done' : 'Pos'}
                                                                        </button>
                                                                        <button 
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const newer = [...productForm.images];
                                                                                newer[idx] = { ...newer[idx], fitMode: newer[idx].fitMode === 'contain' ? 'cover' : 'contain' };
                                                                                setProductForm({...productForm, images: newer});
                                                                            }}
                                                                            className="bg-white text-brand-charcoal hover:bg-brand-cream shadow-xl font-medium text-[9px] px-2 py-1.5 rounded-sm transition-all flex items-center gap-1"
                                                                        >
                                                                            {productForm.images[idx].fitMode === 'contain' ? <Maximize size={10}/> : <Minimize size={10}/>}
                                                                        </button>
                                                                        <button 
                                                                            onClick={(e) => { 
                                                                                e.stopPropagation(); 
                                                                                const newer = productForm.images.filter((_, i) => i !== idx);
                                                                                setProductForm({...productForm, images: newer}); 
                                                                                setAdjustingImageIdx(null); 
                                                                            }} 
                                                                            className="bg-white hover:bg-red-50 text-red-500 p-1.5 rounded-sm shadow-xl transition-all"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {adjustingImageIdx === idx && productForm.images[idx].fitMode !== 'contain' && (
                                                                    <div 
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseMove={(e) => {
                                                                            if (e.buttons !== 1) return;
                                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                                            const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                                                                            const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                                                                            const newer = [...productForm.images];
                                                                            newer[idx] = { ...newer[idx], focalPoint: { x, y } };
                                                                            setProductForm({...productForm, images: newer});
                                                                        }}
                                                                        className="absolute inset-0 z-20 cursor-move bg-brand-rose/5 border border-brand-rose border-dashed"
                                                                    >
                                                                        <div className="absolute w-6 h-6 -ml-3 -mt-3 border border-brand-rose rounded-full pointer-events-none shadow-2xl flex items-center justify-center animate-pulse bg-brand-rose/20" style={{ left: `${productForm.images[idx].focalPoint?.x || 50}%`, top: `${productForm.images[idx].focalPoint?.y || 50}%` }}>
                                                                            <div className="w-1 h-1 bg-brand-rose rounded-full"></div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full relative group">
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-brand-charcoal/10 group-hover:text-brand-rose/30 transition-all bg-white/40">
                                                                    <ImageIcon size={idx === 0 ? 32 : 24} strokeWidth={1} />
                                                                    <span className="text-[8px] font-medium mt-3 uppercase tracking-widest text-center px-4 opacity-40">
                                                                        {idx === 0 ? 'Primary Slot' : `Slot 0${idx+1}`}
                                                                    </span>
                                                                </div>
                                                                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); window._uploadTargetIdx = idx; }} className="p-3 bg-white text-brand-charcoal hover:text-brand-rose rounded-full shadow-xl transition-all">
                                                                        <Upload size={18} />
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); alert('Connecting to Google Drive... Please provide a Client ID to activate this link.'); }} className="p-3 bg-white text-brand-charcoal hover:text-blue-500 rounded-full shadow-xl transition-all">
                                                                        <Cloud size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Column 2: Product Intel */}
                                        <div className="w-full md:w-[60%] flex flex-col p-6 md:p-10 space-y-8">
                                            {/* Identity Section */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <div className="md:col-span-2">
                                                    <label className="text-[12px] font-bold text-brand-charcoal/70 mb-2 block uppercase tracking-wide">Product Name</label>
                                                    <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-brand-cream/50 p-4 font-medium text-2xl border-none focus:ring-1 focus:ring-brand-sage rounded-sm outline-none" placeholder="Vogue..." />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-[12px] font-bold text-brand-charcoal/70 uppercase tracking-wide">Category</label>
                                                        <button onClick={() => setShowNewCategoryInput(!showNewCategoryInput)} className="text-[9px] font-medium text-brand-rose hover:text-brand-charcoal transition-colors">
                                                            {showNewCategoryInput ? 'Existing' : '+ New'}
                                                        </button>
                                                    </div>
                                                    {showNewCategoryInput ? (
                                                        <div className="flex items-center space-x-2 bg-brand-cream/50 rounded-sm pr-2">
                                                            <input value={newCatTemp} onChange={e => setNewCatTemp(e.target.value)} className="flex-grow bg-transparent p-4 font-medium border-none focus:outline-none focus:ring-0 text-sm" placeholder="Add..." autoFocus onKeyDown={(e) => { if(e.key === 'Enter') { if(newCatTemp.trim()){ setSessionCategories(prev => [...new Set([...prev, newCatTemp.trim()])]); setProductForm({...productForm, category: newCatTemp.trim()}); setShowNewCategoryInput(false); setNewCatTemp(''); }}} } />
                                                            <button onClick={() => { if(newCatTemp.trim()){ setSessionCategories(prev => [...new Set([...prev, newCatTemp.trim()])]); setProductForm({...productForm, category: newCatTemp.trim()}); setShowNewCategoryInput(false); setNewCatTemp(''); }}} className="bg-brand-rose text-brand-charcoal p-2 rounded-full hover:bg-white transition-all shadow-md"><Check size={16}/></button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative" ref={dropdownRef}>
                                                            <div onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="w-full bg-brand-cream/50 p-4 font-medium rounded-sm border border-transparent hover:border-brand-charcoal/10 transition-all cursor-pointer flex justify-between items-center text-sm h-[60px]">
                                                                <span className={productForm.category ? 'text-brand-charcoal' : 'text-brand-charcoal/30'}>{productForm.category || 'Select...'}</span>
                                                                <ChevronDown className={`transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                                                            </div>
                                                            <AnimatePresence>
                                                                {isCategoryDropdownOpen && (
                                                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute left-0 right-0 mt-2 bg-white border border-brand-charcoal/5 shadow-2xl rounded-sm z-[110] overflow-hidden">
                                                                        <div className="max-h-60 overflow-y-auto">
                                                                            {[...(settings.categories || []), ...sessionCategories].map((cat, i) => (
                                                                                <div key={i} className={`flex items-center justify-between p-4 cursor-pointer transition-all ${productForm.category === cat ? 'bg-brand-rose' : 'hover:bg-brand-cream/40'}`} onClick={() => { setProductForm({...productForm, category: cat}); setIsCategoryDropdownOpen(false); }}>
                                                                                    <span className="text-sm font-medium">{cat}</span>
                                                                                    {productForm.category === cat && <Check size={14} />}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Narrative Section */}
                                            <div className="flex-grow flex flex-col space-y-4 bg-[#F4F1EA]/40 p-8 rounded-sm border border-brand-charcoal/5 shadow-sm">
                                                <label className="text-[12px] font-bold text-brand-charcoal/70 uppercase tracking-wide">Brief hook (SEO summary)</label>
                                                <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="flex-grow w-full bg-brand-cream/20 p-6 text-xl font-medium border-none resize-none outline-none focus:ring-1 focus:ring-brand-sage rounded-sm leading-relaxed italic" placeholder="The philosophy behind this creation..." />
                                            </div>

                                            {/* Financial Bar */}
                                            <div className="grid grid-cols-3 gap-8 text-brand-charcoal">
                                                <div className="bg-brand-charcoal p-6 rounded-sm text-white shadow-lg">
                                                    <label className="text-[11px] font-bold text-white/70 block mb-2 uppercase tracking-widest">Base Price (₹)</label>
                                                    <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseInt(e.target.value)})} className="w-full bg-transparent text-2xl font-medium outline-none border-none p-0" />
                                                </div>
                                                <div className="bg-brand-rose p-6 rounded-sm text-brand-charcoal shadow-lg">
                                                    <label className="text-[11px] font-bold text-brand-charcoal/70 block mb-2 uppercase tracking-widest">Discount Price</label>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-lg opacity-40">₹</span>
                                                        <input type="number" placeholder="None" value={productForm.discountPrice || ''} onChange={e => setProductForm({...productForm, discountPrice: e.target.value ? parseInt(e.target.value) : null})} className="w-full bg-transparent text-2xl font-medium outline-none border-none p-0 placeholder:text-brand-charcoal/20" />
                                                    </div>
                                                </div>
                                                <div className="bg-[#F4F1EA]/60 p-6 rounded-sm border border-brand-charcoal/5 shadow-sm flex flex-col">
                                                    <label className="text-[11px] font-bold text-brand-charcoal/70 block mb-2 uppercase tracking-widest">Stock Units</label>
                                                    <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full bg-transparent text-2xl font-medium p-0 border-none outline-none text-brand-charcoal" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Safe Action Hub (Sticky Footer) */}
                                    <div className="bg-[#F4F1EA] border-t border-brand-charcoal/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 sticky bottom-0 z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                                        {/* Audit Checklist (Left) */}
                                        <div className="flex items-center gap-6 px-6 py-3 bg-brand-cream/30 rounded-full border border-brand-charcoal/5">
                                            <div className="text-[11px] font-bold text-brand-charcoal/60 uppercase tracking-widest mr-2">Audit</div>
                                            <div className={`flex items-center gap-1.5 text-[10px] font-bold transition-all ${productForm.name?.trim() ? 'text-green-600' : 'text-brand-charcoal/40'}`}>
                                                {productForm.name?.trim() ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-brand-charcoal/30" />} NAME
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[10px] font-bold transition-all ${productForm.price > 0 ? 'text-green-600' : 'text-brand-charcoal/40'}`}>
                                                {productForm.price > 0 ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-brand-charcoal/30" />} PRICE
                                            </div>
                                            <div className={`flex items-center gap-1.5 text-[10px] font-bold transition-all ${(productForm.images || []).filter(img => img.url).length >= 2 ? 'text-green-600' : 'text-brand-charcoal/40'}`}>
                                                {(productForm.images || []).filter(img => img.url).length >= 2 ? <CheckCircle2 size={14} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-brand-charcoal/30" />} 2+ PHOTOS
                                            </div>
                                        </div>

                                        {/* Final Action Hub (Right) */}
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <button 
                                                disabled={!(productForm.name?.trim() && productForm.price > 0 && (productForm.images || []).filter(img => img.url).length >= 2)}
                                                onClick={async () => {
                                                    const sortedImages = [...(productForm.images || [])].sort((a, b) => a.sequence - b.sequence);
                                                    const finalForm = { ...productForm, imageName: sortedImages[0]?.url || '' };
                                                    if (isEditingProduct === 'new') await addProduct(finalForm);
                                                    else await updateProduct(isEditingProduct, finalForm);
                                                    setProductForm({ name: '', category: '', price: 0, stock: 5, images: [], description: '', descriptionBlocks: [] });
                                                    setIsEditingProduct('new');
                                                }}
                                                className={`px-10 py-5 rounded-sm text-sm font-bold transition-all flex-grow md:flex-initial shadow-lg ${!(productForm.name?.trim() && productForm.price > 0 && (productForm.images || []).filter(img => img.url).length >= 2) ? 'bg-brand-charcoal/10 text-brand-charcoal/50 cursor-not-allowed shadow-none' : 'bg-white text-brand-charcoal border border-brand-charcoal hover:bg-brand-cream'}`}
                                            >
                                                Save & add another
                                            </button>
                                            <button 
                                                disabled={!(productForm.name?.trim() && productForm.price > 0 && (productForm.images || []).filter(img => img.url).length >= 2)}
                                                onClick={async () => {
                                                    const sortedImages = [...(productForm.images || [])].sort((a, b) => a.sequence - b.sequence);
                                                    const finalForm = { ...productForm, imageName: sortedImages[0]?.url || '' };
                                                    if (isEditingProduct === 'new') await addProduct(finalForm);
                                                    else await updateProduct(isEditingProduct, finalForm);
                                                    setIsEditingProduct(null);
                                                }}
                                                className={`px-14 py-5 rounded-sm text-sm font-bold shadow-2xl transition-all flex-grow md:flex-initial ${!(productForm.name?.trim() && productForm.price > 0 && (productForm.images || []).filter(img => img.url).length >= 2) ? 'bg-brand-sage/20 text-brand-charcoal/50 cursor-not-allowed' : 'bg-brand-rose text-brand-charcoal hover:opacity-80'}`}
                                            >
                                                Synchronize listing
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'banners' && (
                    <div className="space-y-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-medium">Front-page identities</h2>
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={() => {
                                        const newBanner = { 
                                            title: 'New Identity', 
                                            subtitle: 'Brief brand narrative...', 
                                            cta: 'Explore', 
                                            image: '' 
                                        };
                                        updateBanners([...banners, newBanner]);
                                    }}
                                    className="bg-brand-rose text-brand-charcoal px-6 py-3 rounded-sm flex items-center space-x-2 text-[11px] font-medium shadow-lg hover:opacity-80 transition-all"
                                >
                                    <Plus size={16} />
                                    <span>Initiate new banner</span>
                                </button>
                                <p className="text-[13px] font-bold text-brand-charcoal/60">Total active: {banners.length}</p>
                            </div>
                        </div>
                        
                        {banners.map((banner, index) => (
                            <div key={banner.id} className="bg-white p-10 rounded-sm shadow-sm border border-[#CD664D]/10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[13px] font-bold text-brand-charcoal opacity-70">Hero banner {index + 1}</h3>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm('Dissolve this front-page identity?')) {
                                                    const nb = banners.filter((_, i) => i !== index);
                                                    updateBanners(nb);
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-500 transition-colors p-1"
                                            title="Delete Banner"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[13px] font-bold text-brand-charcoal/60 mb-1 block">Main title</label>
                                            <input 
                                                defaultValue={banner.title} 
                                                onBlur={e => {
                                                    const nb = [...banners]; nb[index].title = e.target.value; updateBanners(nb);
                                                }} 
                                                className="w-full text-3xl font-medium border-b border-brand-charcoal/10 focus:border-brand-charcoal outline-none bg-transparent py-2" 
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[13px] font-bold text-brand-charcoal/60 mb-1 block">Sub-narrative</label>
                                            <input 
                                                defaultValue={banner.subtitle} 
                                                onBlur={e => {
                                                    const nb = [...banners]; nb[index].subtitle = e.target.value; updateBanners(nb);
                                                }} 
                                                className="w-full text-brand-charcoal/70 border-b border-brand-charcoal/10 focus:border-brand-charcoal outline-none bg-transparent py-2" 
                                            />
                                        </div>
                                        <div className="flex space-x-6">
                                            <div className="flex-grow">
                                                <label className="text-[13px] font-bold text-brand-charcoal/60 mb-1 block">Asset identifier</label>
                                                <button 
                                                    onClick={() => openMediaPicker({
                                                        multi: false,
                                                        selectedItems: [banner.image],
                                                        onSelect: (url) => {
                                                            const nb = [...banners]; nb[index].image = url; updateBanners(nb);
                                                        }
                                                    })}
                                                    className="w-full text-left text-sm font-medium border-b border-brand-charcoal/10 outline-none bg-transparent py-2 flex justify-between items-center"
                                                >
                                                    <span className="truncate">{banner.image || 'Pick banner image'}</span>
                                                    <Upload size={14} className="text-brand-charcoal/40" />
                                                </button>
                                            </div>

                                            <div>
                                                <label className="text-[13px] font-bold text-brand-charcoal/80 mb-1 block">CTA label</label>
                                                <input 
                                                    defaultValue={banner.cta} 
                                                    onBlur={e => {
                                                        const nb = [...banners]; nb[index].cta = e.target.value; updateBanners(nb);
                                                    }} 
                                                    className="w-full text-sm font-medium border-b border-brand-charcoal/10 outline-none bg-transparent py-2" 
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
                            <button className="bg-brand-rose text-brand-charcoal px-12 py-5 rounded-sm text-[18px] font-medium shadow-xl hover:opacity-80 transition-all">
                                All configurations synchronized
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
                                    <Upload className="text-brand-charcoal/40 mb-4 group-hover:scale-110 transition-transform" size={48} />
                                    <h3 className="text-xl font-medium mb-2">Upload new identity</h3>
                                    <p className="text-brand-charcoal/40 text-sm font-medium">JPEG or PNG up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {media.map((item) => (
                                <div key={item.id} className="group relative bg-white border border-[#CD664D]/10 rounded-sm overflow-hidden aspect-square">
                                    <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                        <p className="text-white text-[10px] font-medium truncate">{item.name}</p>
                                        <button className="text-white mt-2 hover:text-red-400 absolute top-4 right-4"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                            {/* Placeholders for static shots */}
                            {['IMG_6135', 'IMG_6137', 'IMG_6144', 'IMG_6154', 'IMG_6169', 'IMG_6214'].map(name => (
                                <div key={name} className="group relative bg-white border border-[#CD664D]/10 rounded-sm overflow-hidden aspect-square opacity-50">
                                    <img src={getProductImage(name)} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="bg-white/80 px-2 py-1 text-[8px] font-medium tracking-wide">Static asset</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-8 rounded-sm shadow-sm border border-brand-charcoal/5 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="flex items-center space-x-6">
                                    <div className="w-16 h-16 bg-brand-charcoal/5 rounded-full flex items-center justify-center text-brand-charcoal/40">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-brand-charcoal text-xl">Order #{order.id.slice(-6).toUpperCase()}</h3>
                                        <p className="text-xs text-brand-charcoal/40 mt-1 font-medium">{order.customerName} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-12">
                                    <div className="text-right">
                                        <p className="text-[10px] font-medium text-brand-charcoal/40 mb-1">Status</p>
                                        <div className="flex items-center text-green-600 text-[10px] font-medium tracking-wide">
                                            <CheckCircle size={14} className="mr-2" /> {order.status}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-medium text-brand-charcoal/40 mb-1">Impact</p>
                                        <p className="font-medium text-brand-charcoal text-xl">₹{order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <button 
                                        onClick={() => alert(`Generating tax invoice for order #${order.id}...`)}
                                        className="w-full flex items-center px-6 py-4 rounded-sm text-brand-charcoal hover:bg-brand-rose/20 transition-colors"
                                    >
                                        <Printer size={16} />
                                        <span>Invoice</span>
                                    </button>
                                    <button className="bg-brand-rose text-brand-charcoal px-12 py-5 text-[18px] font-medium hover:bg-white transition-all shadow-md">Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-4xl space-y-12">
                        <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <h3 className="text-[11px] font-medium text-brand-charcoal/40 mb-8">Base configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-medium text-brand-charcoal/40 block">Shop identity (branding text)</label>
                                    <input 
                                        value={localSettings.shopName} 
                                        onChange={e => setLocalSettings({...localSettings, shopName: e.target.value})}
                                        className="w-full bg-brand-cream p-4 font-medium text-xl border-none focus:ring-1 focus:ring-brand-charcoal/10"
                                    />
                                    <p className="text-[10px] text-brand-charcoal/40 italic">Used in emails and SEO meta tags.</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[11px] font-medium text-brand-charcoal/40 block">Active currency</label>
                                    <select 
                                        value={localSettings.currency?.code} 
                                        onChange={e => {
                                            const currencies = {
                                                USD: { code: 'USD', symbol: '$', rate: 1 },
                                                INR: { code: 'INR', symbol: '₹', rate: 83 },
                                                EUR: { code: 'EUR', symbol: '€', rate: 0.92 }
                                            };
                                            setLocalSettings({...localSettings, currency: currencies[e.target.value]});
                                        }}
                                        className="w-full bg-brand-cream p-4 font-medium border-none focus:ring-1 focus:ring-brand-charcoal/10 appearance-none"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="INR">INR (₹)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-rose p-10 rounded-sm text-brand-charcoal shadow-lg">
                            <h3 className="text-[11px] font-medium opacity-40 mb-8">Global discount override</h3>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-1 space-y-4">
                                    <p className="text-sm italic opacity-60">Apply a universal percentage reduction across all product listings instantly. Use 0 to disable.</p>
                                    <div className="flex items-center space-x-4">
                                        <input 
                                            type="range" min="0" max="70" step="5"
                                            value={localSettings.globalDiscount}
                                            onChange={e => setLocalSettings({...localSettings, globalDiscount: parseInt(e.target.value)})}
                                            className="flex-grow accent-brand-charcoal"
                                        />
                                        <span className="text-4xl font-medium w-20 text-right">{localSettings.globalDiscount}%</span>
                                    </div>
                                </div>
                                <div className="w-full md:w-px h-px md:h-20 bg-white/10" />
                                <div className="flex-shrink-0">
                                    <button 
                                        onClick={saveSettings}
                                        className="bg-white text-brand-charcoal px-10 py-5 rounded-sm text-sm font-medium shadow-lg hover:bg-brand-sage transition-all"
                                    >
                                        Synchronize all settings
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <h3 className="text-[11px] font-medium text-brand-charcoal/40 mb-8">Category orchestration</h3>
                            <div className="space-y-6">
                                {(localSettings.categories || ['Accessories', 'Toys', 'Beds']).map((cat, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-6 bg-brand-cream/30 rounded-sm group hover:bg-brand-rose/10 transition-all border border-transparent hover:border-brand-rose/20">
                                        <div className="flex items-center space-x-6">
                                            <div className="w-10 h-10 bg-brand-charcoal/5 rounded-full flex items-center justify-center text-[10px] font-medium text-brand-charcoal/40 group-hover:bg-brand-rose group-hover:text-brand-charcoal transition-all">
                                                0{idx + 1}
                                            </div>
                                            <span className="text-lg font-medium text-brand-charcoal">{cat}</span>
                                        </div>
                                        <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    const newName = window.prompt(`Rename "${cat}" to:`, cat);
                                                    if (newName && newName !== cat) {
                                                        const updatedCats = localSettings.categories.map(c => c === cat ? newName : c);
                                                        setLocalSettings({...localSettings, categories: updatedCats});
                                                        
                                                        // Batch update products
                                                        const affectedProducts = products.filter(p => p.category === cat);
                                                        affectedProducts.forEach(p => {
                                                            updateProduct(p.id, { ...p, category: newName });
                                                        });
                                                    }
                                                }}
                                                className="text-brand-charcoal/40 hover:text-brand-charcoal transition-colors"
                                                title="Rename"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm(`Delete the "${cat}" category? Products in this category will remain but the category will be removed from future selection.`)) {
                                                        const updatedCats = localSettings.categories.filter(c => c !== cat);
                                                        setLocalSettings({...localSettings, categories: updatedCats});
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4">
                                    <button 
                                        onClick={() => {
                                            const newCat = window.prompt("Enter new category name:");
                                            if (newCat && !localSettings.categories.includes(newCat)) {
                                                setLocalSettings({...localSettings, categories: [...localSettings.categories, newCat]});
                                            }
                                        }}
                                        className="text-[11px] font-medium text-brand-rose hover:text-brand-charcoal transition-all flex items-center space-x-2"
                                    >
                                        <Plus size={14} />
                                        <span>Establish new category</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-sm border border-yellow-200/50 flex items-start space-x-6">
                            <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
                            <div>
                                <h4 className="text-[11px] font-medium text-yellow-800 mb-1">Safety protocol</h4>
                                <p className="text-xs text-yellow-700/80 leading-relaxed">Changes made here are applied globally and in real-time. Ensure all values are verified before synchronization to prevent display inconsistencies in the storefront.</p>
                            </div>
                        </div>

                        <div className="flex justify-start pt-4 border-t border-brand-charcoal/5">
                            <button 
                                onClick={async () => {
                                    if(window.confirm("This will synchronize all branding and content to the latest version. Proceed?")) {
                                        await mockApi.resetAllData();
                                    }
                                }}
                                className="bg-brand-rose text-brand-charcoal px-14 py-8 rounded-sm text-[18px] font-medium shadow-xl hover:bg-white transition-all flex items-center space-x-4"
                            >
                                <RefreshCcw size={20} />
                                <span>Sync brand & content</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {mediaPickerConfig.isOpen && (
                    <MediaPicker 
                        {...mediaPickerConfig} 
                        onClose={() => setMediaPickerConfig(prev => ({ ...prev, isOpen: false }))} 
                    />
                )}
            </AnimatePresence>
            {/* Master Category Manager Modal */}
            <AnimatePresence>
                {showCategoryManager && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryManager(false)} className="absolute inset-0 bg-brand-charcoal/80 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-sm overflow-hidden shadow-2xl">
                            <div className="p-8 bg-brand-cream/30 border-b border-brand-charcoal/5 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-medium text-brand-charcoal">Manage Categories</h3>
                                    <p className="text-xs text-brand-charcoal/40 mt-1 uppercase tracking-widest">Master Store Taxonomy</p>
                                </div>
                                <button onClick={() => setShowCategoryManager(false)} className="p-2 hover:bg-white rounded-full transition-all text-brand-charcoal/20 hover:text-brand-charcoal"><X size={20} /></button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                {/* Add New Category */}
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        placeholder="New Category Name..."
                                        className="flex-grow bg-brand-cream/50 p-4 font-medium rounded-sm border border-transparent focus:border-brand-rose outline-none text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newCategoryName.trim()) {
                                                const updated = [...(settings.categories || []), newCategoryName.trim()];
                                                updateSettings({ ...settings, categories: updated });
                                                setNewCategoryName('');
                                            }
                                        }}
                                    />
                                    <button 
                                        onClick={() => {
                                            if (newCategoryName.trim()) {
                                                const updated = [...(settings.categories || []), newCategoryName.trim()];
                                                updateSettings({ ...settings, categories: updated });
                                                setNewCategoryName('');
                                            }
                                        }}
                                        className="bg-brand-charcoal text-white p-4 rounded-sm hover:bg-black transition-all shadow-lg"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                {/* Master List */}
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {(settings.categories || []).map((cat, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-brand-cream/20 rounded-sm group hover:bg-brand-cream/40 transition-all border border-transparent hover:border-brand-rose/10">
                                            <span className="font-medium text-brand-charcoal">{cat}</span>
                                            <button 
                                                onClick={() => {
                                                    const updated = settings.categories.filter((_, idx) => idx !== i);
                                                    updateSettings({ ...settings, categories: updated });
                                                }}
                                                className="opacity-20 group-hover:opacity-100 text-red-500 hover:scale-110 transition-all p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-brand-cream/10 border-t border-brand-charcoal/5 flex justify-end">
                                <button onClick={() => setShowCategoryManager(false)} className="px-8 py-3 bg-brand-rose text-brand-charcoal font-medium text-[11px] uppercase tracking-widest rounded-sm shadow-xl hover:opacity-80 transition-all">Done Managing</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default AdminDashboard;
