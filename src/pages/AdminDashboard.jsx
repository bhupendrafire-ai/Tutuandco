import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Package, ShoppingCart, Settings, 
    LogOut, Plus, Trash2, Edit3, 
    X, Upload, Check, AlertCircle, 
    FileText, CheckCircle, Printer, RefreshCcw, 
    Image as ImageIcon, Menu, Layout, ChevronDown, CheckCircle2,
    Maximize, Minimize, Cloud, AlignLeft, AlignCenter, AlignRight, EyeOff, ChevronUp, Crosshair,
    DollarSign, Users, TrendingUp
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { upload } from '@vercel/blob/client';
import { useShop, getProductImage, FINAL_API_URL } from '../context/ShopContext';
import MediaPicker from '../components/MediaPicker';
import logo from '../assets/logo.png';
import logoWhite from '../assets/logo-white.png';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { '*': dashPath } = useParams();
    const [activeTab, setActiveTab] = useState(dashPath?.split('/').filter(Boolean)[0] || 'overview');
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
    
    const fileInputRef = useRef(null);
    const activeImageRef = useRef(null);
    const naturalAspectRef = useRef(1);
    const uploadTargetIdx = useRef(null);
    const localFocal = useRef({ x: 50, y: 50 });
    const startingFocalRef = useRef({ x: 50, y: 50 });

    const [productForm, setProductForm] = useState({ 
        name: '', price: 0, discountPrice: null, stock: 0, 
        category: '', description: '', imageName: '',
        images: [], descriptionBlocks: [] 
    });
    const [isEditingProduct, setIsEditingProduct] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isBulkDiscountModalOpen, setIsBulkDiscountModalOpen] = useState(false);
    const [bulkDiscountValue, setBulkDiscountValue] = useState(10);
    const [adjustingBannerIdx, setAdjustingBannerIdx] = useState(null);
    const [panningPoint, setPanningPoint] = useState(null);
    const [interactingZoom, setInteractingZoom] = useState(null);

    const [mediaPickerConfig, setMediaPickerConfig] = useState({ isOpen: false, multi: false, onSelect: () => {}, selectedItems: [] });
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCatTemp, setNewCatTemp] = useState('');
    const [sessionCategories, setSessionCategories] = useState([]);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
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

    useEffect(() => {
        const loadOrders = async () => {
            console.log("🛡️ AdminDashboard Version: 2026-04-01-V2-STABILITY");
            try {
                const res = await fetch(`${FINAL_API_URL}/api/orders`);
                const o = await res.json();
                const safeOrders = Array.isArray(o) ? o : [];
                setOrders(safeOrders);
                const total = safeOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
                setStats(prev => ({
                    ...prev,
                    totalSales: total,
                    totalOrders: safeOrders.length,
                    totalCustomers: 142
                }));
            } catch (err) {
                console.error("Orders sync failed:", err);
                setOrders([]);
            } finally {
                setLoading(false);
            }
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

        const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
        if (isHEIC) {
            try {
                const heic2any = (await import('https://esm.sh/heic2any')).default;
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                });
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
                const targetIdx = uploadTargetIdx.current !== null ? uploadTargetIdx.current : productForm.images.length;
                const newImg = { 
                    url: newBlob.url, 
                    name: file.name, 
                    isInternal: false, 
                    sequence: targetIdx,
                    fitMode: 'cover',
                    focalPoint: { x: 50, y: 50 }
                };
                
                const newer = [...(productForm.images || [])];
                for(let i=0; i<targetIdx; i++) if(!newer[i]) newer[i] = { url: '', fitMode: 'cover', focalPoint: {x:50,y:50} };
                newer[targetIdx] = newImg;
                
                setProductForm(prev => ({ ...prev, images: newer.filter(img => img.url || img === newImg) }));
                uploadTargetIdx.current = null;
            } else {
                await uploadMedia(newBlob.url, file.name);
                alert("Identity uploaded to Vercel Cloud!");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message || "Unknown error"}.`);
        }
    };

    const triggerUpload = (idx) => {
        uploadTargetIdx.current = idx;
        fileInputRef.current?.click();
    };

    const SidebarItem = ({ icon: Icon, label, active, onClick, id }) => (
        <button 
            onClick={() => onClick(id)}
            className={`w-full flex items-center space-x-4 p-4 rounded-sm transition-all duration-300 ${
                active 
                    ? 'bg-brand-charcoal text-white shadow-lg scale-[1.02]' 
                    : 'text-brand-charcoal/60 hover:bg-white/40'
            }`}
        >
            {Icon}
            <span className="text-[13px] font-bold tracking-wide">{label}</span>
        </button>
    );

    const openMediaPicker = (config) => {
        setMediaPickerConfig({ ...config, isOpen: true });
    };

    const handleToggleSelect = (id) => {
        setSelectedProductIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProductIds(products.map(p => p.id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const applyBulkDiscount = async () => {
        if (!selectedProductIds.length) return;
        const confirmMsg = `Apply a ${bulkDiscountValue}% discount to ${selectedProductIds.length} items?`;
        if (window.confirm(confirmMsg)) {
            for (const id of selectedProductIds) {
                const product = products.find(p => p.id === id);
                if (product) {
                    const discountAmt = (product.price * (bulkDiscountValue / 100));
                    const newDiscountPrice = Math.round(product.price - discountAmt);
                    await updateProduct(id, { ...product, discountPrice: newDiscountPrice });
                }
            }
            setSelectedProductIds([]);
            setIsBulkDiscountModalOpen(false);
            alert("Bulk discount synchronized successfully!");
        }
    };

    return (
        <div className="min-h-screen bg-brand-sage flex text-brand-charcoal relative">
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-brand-cream border-b border-brand-charcoal/10 z-50 flex items-center justify-between px-6">
                <img src={logo} alt="Tutu & Co" className="h-10 w-auto" />
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-brand-charcoal">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <aside className={`fixed lg:relative inset-y-0 left-0 w-72 bg-[#B4BFA8] border-r border-brand-charcoal/5 p-8 flex flex-col pt-32 lg:pt-32 z-[60] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 shadow-2xl lg:shadow-none'}`}>
                <div className="flex-grow space-y-2">
                        <SidebarItem id="overview" icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
                        <SidebarItem id="products" icon={<Package size={20} />} label="Products" active={activeTab === 'products'} onClick={setActiveTab} />
                        <SidebarItem id="banners" icon={<ImageIcon size={20} />} label="Hero Banners" active={activeTab === 'banners'} onClick={setActiveTab} />
                        <SidebarItem id="media" icon={<ImageIcon size={20} />} label="Media Library" active={activeTab === 'media'} onClick={setActiveTab} />
                        <SidebarItem id="orders" icon={<ShoppingCart size={20} />} label="Customer Orders" active={activeTab === 'orders'} onClick={setActiveTab} />
                        <SidebarItem id="settings" icon={<Settings size={20} />} label="Store Settings" active={activeTab === 'settings'} onClick={setActiveTab} />
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

            <main className="flex-grow p-6 lg:p-12 pt-28 lg:pt-32 overflow-x-hidden">
                <header className="flex justify-between items-end mb-12 border-b border-brand-charcoal/10 pb-8">
                    <div>
                        <h1 className="text-4xl font-medium text-brand-charcoal mb-2 capitalize">{activeTab.replace('-', ' ')}</h1>
                        <p className="text-brand-charcoal/80 text-sm font-bold">System status: <span className="text-brand-rose">Connected & Calibrating.</span></p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <h2 className="text-2xl font-medium text-brand-charcoal capitalize">{activeTab}</h2>
                            <p className="text-[10px] font-medium text-brand-charcoal/40 uppercase tracking-widest">
                                Online Store Environment
                            </p>
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && (
                    <div className="space-y-12">
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

                        <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <h2 className="text-xl font-medium text-brand-charcoal mb-8">Revenue trends (weekly)</h2>
                        <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                                            <th className="p-6 w-12 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    onChange={handleSelectAll}
                                                    checked={selectedProductIds.length === products.length && products.length > 0}
                                                    className="w-5 h-5 accent-brand-rose rounded-sm cursor-pointer" 
                                                />
                                            </th>
                                            <th className="p-6">Product</th>
                                            <th className="p-6">Stock</th>
                                            <th className="p-6">Price</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F4F1EA]">
                                        {products.map((item) => (
                                            <tr key={item.id} className={`hover:bg-[#F4F1EA]/50 transition-colors ${selectedProductIds.includes(item.id) ? 'bg-[#CD664D]/5' : ''}`}>
                                                <td className="p-6 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedProductIds.includes(item.id)}
                                                        onChange={() => handleToggleSelect(item.id)}
                                                        className="w-5 h-5 accent-brand-rose rounded-sm cursor-pointer" 
                                                    />
                                                </td>
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
                                                        setProductForm(item);
                                                        setIsEditingProduct(item.id);
                                                    }}><Edit3 size={18} /></button>
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                                                deleteProduct(item.id);
                                                            }
                                                        }}
                                                        className="hover:text-red-500 transition-colors"
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
                    </div>
                )}

                <AnimatePresence>
                    {selectedProductIds.length > 0 && (
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-brand-charcoal text-white p-6 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] flex items-center gap-10 min-w-[600px] border border-white/10"
                        >
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-white/90">{selectedProductIds.length} items selected</span>
                                <button onClick={() => setSelectedProductIds([])} className="text-[12px] text-brand-rose font-bold hover:underline text-left">Clear selection</button>
                            </div>
                            <div className="h-10 w-px bg-white/20 mx-2" />
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/10 p-2 rounded-sm border border-white/5">
                                    <span className="text-[13px] font-bold text-white/60">Discount %</span>
                                    <input 
                                        type="number" 
                                        value={bulkDiscountValue} 
                                        onChange={(e) => setBulkDiscountValue(parseInt(e.target.value))}
                                        className="w-16 bg-transparent text-lg font-bold outline-none border-none text-brand-rose p-0" 
                                    />
                                </div>
                                <button 
                                    onClick={applyBulkDiscount}
                                    className="bg-brand-rose text-brand-charcoal px-8 py-3 rounded-sm text-sm font-bold shadow-lg hover:opacity-90 transition-all"
                                >
                                    Apply Bulk Discount
                                </button>
                            </div>
                            <button 
                                onClick={async () => {
                                    if(window.confirm(`Dissolve ${selectedProductIds.length} listings permanently?`)) {
                                        for(const id of selectedProductIds) await deleteProduct(id);
                                        setSelectedProductIds([]);
                                    }
                                }}
                                className="flex items-center gap-2 text-white/50 hover:text-red-500 transition-colors ml-auto group"
                            >
                                <Trash2 size={20} />
                                <span className="text-[13px] font-bold">Mass Delete</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isEditingProduct && (
                        <div 
                            className="fixed inset-0 bg-[#3E362E]/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 md:p-12 cursor-pointer"
                            onClick={() => setIsEditingProduct(null)}
                        >
                            <motion.div 
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                                className="bg-[#F4F1EA] w-full max-w-7xl h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col cursor-default relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                    <button onClick={() => setIsEditingProduct(null)} className="absolute top-4 right-4 p-2 bg-brand-charcoal text-white rounded-full hover:bg-black transition-all shadow-xl z-[200]"><X size={16} /></button>
                                    <div className="bg-[#F4F1EA] border-b border-[#CD664D]/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-medium text-brand-charcoal">
                                                {isEditingProduct === 'new' ? 'New creation' : `Refining: ${productForm.name}`}
                                            </h2>
                                        </div>
                                    </div>
                                    <div className="flex-grow overflow-y-auto flex flex-col md:flex-row custom-scrollbar">
                                        <div className="w-full md:w-[40%] bg-[#F4F1EA]/60 border-r border-brand-charcoal/5 flex flex-col p-6 md:p-10 overflow-hidden">
                                            <h3 className="text-[12px] font-bold text-brand-charcoal/70 uppercase tracking-widest mb-6">Media Hub</h3>
                                            <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-1 overflow-hidden mb-6">
                                                {[0, 1, 2, 3].map((idx) => (
                                                    <div key={idx} className="relative rounded-sm border border-brand-charcoal/10 overflow-hidden group shadow-sm bg-white/50">
                                                        {productForm.images?.[idx] ? (
                                                            <img src={getProductImage(productForm.images[idx].url, media)} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer" onClick={() => triggerUpload(idx)}>
                                                                <ImageIcon size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'product_image')} />
                                        </div>
                                        <div className="w-full md:w-[60%] flex flex-col p-6 md:p-10 space-y-8">
                                            <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-brand-cream/50 p-4 font-medium text-2xl border-none rounded-sm outline-none" placeholder="Product Name" />
                                            <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows="4" className="w-full bg-white p-6 text-lg font-medium border-none rounded-sm" placeholder="Description" />
                                            <div className="grid grid-cols-3 gap-8">
                                                <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseInt(e.target.value)})} className="bg-brand-charcoal text-white p-6 rounded-sm text-2xl font-medium" />
                                                <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="bg-[#F4F1EA]/60 p-6 rounded-sm text-2xl font-medium" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#F4F1EA] border-t border-brand-charcoal/10 p-8 flex justify-end gap-4">
                                        <button onClick={() => setIsEditingProduct(null)} className="px-8 py-4 bg-brand-rose text-brand-charcoal font-bold rounded-sm">Save Listing</button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                {activeTab === 'banners' && (
                    <div className="space-y-12">
                        <div className="flex justify-between items-center mb-8 pb-8 border-b border-brand-charcoal/10">
                            <div>
                                <p className="text-[10px] font-medium text-brand-charcoal/40 uppercase tracking-[0.2em] mb-1">Homepage Slideshow</p>
                                <h3 className="text-2xl font-medium text-brand-charcoal">Digital Identity Banners</h3>
                            </div>
                            <button 
                                onClick={() => updateBanners([...banners, { 
                                    id: Date.now(), 
                                    title: 'New Narrative Title', 
                                    subtitle: 'Supporting subtitle here',
                                    cta: 'Explore Collection', 
                                    image: '', 
                                    isVisible: true,
                                    zoom: 1,
                                    translateX: 0,
                                    translateY: 0,
                                    refWidth: 1920,
                                    refHeight: 1080,
                                    fitMode: 'cover'
                                }])} 
                                className="bg-brand-rose text-brand-charcoal px-8 py-4 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl flex items-center space-x-3"
                            >
                                <Plus size={16} />
                                <span>Create New Banner</span>
                            </button>
                        </div>
                        <div className="space-y-12">
                            {banners.map((banner, index) => (
                                <div key={banner.id || index} className="bg-white rounded-sm shadow-xl border border-[#CD664D]/10 overflow-hidden">
                                     <div className="flex flex-col md:flex-row">
                                        {/* Banner Preview */}
                                        <div className="w-full md:w-1/2 aspect-[16/9] bg-brand-cream relative group cursor-crosshair overflow-hidden">
                                            {banner.image ? (
                                                <img 
                                                    src={getProductImage(banner.image, media)} 
                                                    className="w-full h-full object-cover transition-transform duration-500"
                                                    style={{ 
                                                        transform: `translate(${banner.translateX || 0}px, ${banner.translateY || 0}px) scale(${banner.zoom || 1})`,
                                                        objectFit: banner.fitMode || 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-brand-charcoal/20">
                                                    <ImageIcon size={48} className="mb-4" />
                                                    <span className="text-xs font-bold uppercase tracking-widest">No Asset Assigned</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                                <button 
                                                    onClick={() => {
                                                        openMediaPicker({
                                                            multi: false,
                                                            onSelect: (items) => {
                                                                const nb = [...banners];
                                                                nb[index] = { ...nb[index], image: items[0].url };
                                                                updateBanners(nb);
                                                            }
                                                        });
                                                    }}
                                                    className="px-6 py-3 bg-white text-brand-charcoal text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-brand-rose transition-all"
                                                >
                                                    Change Asset
                                                </button>
                                                <button 
                                                    onClick={() => setAdjustingBannerIdx(index)}
                                                    className="px-6 py-3 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white hover:text-brand-charcoal transition-all"
                                                >
                                                    Calibrate Hub
                                                </button>
                                            </div>
                                        </div>

                                        {/* Banner Form */}
                                        <div className="w-full md:w-1/2 p-10 space-y-8 flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <input 
                                                        value={banner.title} 
                                                        onChange={e => {
                                                            const nb = [...banners];
                                                            nb[index] = { ...nb[index], title: e.target.value };
                                                            updateBanners(nb);
                                                        }}
                                                        className="text-2xl font-medium text-brand-charcoal bg-transparent border-none focus:ring-0 w-full"
                                                        placeholder="Narrative Title"
                                                    />
                                                    <div className="flex items-center space-x-2">
                                                        <button 
                                                            onClick={() => {
                                                                const nb = [...banners];
                                                                nb[index] = { ...nb[index], isVisible: !nb[index].isVisible };
                                                                updateBanners(nb);
                                                            }}
                                                            className={`p-2 rounded-full transition-all ${banner.isVisible !== false ? 'text-green-500' : 'text-brand-charcoal/20'}`}
                                                        >
                                                            {banner.isVisible !== false ? <CheckCircle2 size={20} /> : <EyeOff size={20} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                if (window.confirm("Permanently archive this banner?")) {
                                                                    const nb = banners.filter((_, i) => i !== index);
                                                                    updateBanners(nb);
                                                                }
                                                            }}
                                                            className="p-2 text-brand-charcoal/20 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <textarea 
                                                    value={banner.subtitle}
                                                    onChange={e => {
                                                        const nb = [...banners];
                                                        nb[index] = { ...nb[index], subtitle: e.target.value };
                                                        updateBanners(nb);
                                                    }}
                                                    className="w-full text-sm text-brand-charcoal/60 bg-transparent border-none focus:ring-0 resize-none h-20"
                                                    placeholder="Enter descriptive subtitle..."
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest block mb-2">CTA Label</label>
                                                        <input 
                                                            value={banner.cta}
                                                            onChange={e => {
                                                                const nb = [...banners];
                                                                nb[index] = { ...nb[index], cta: e.target.value };
                                                                updateBanners(nb);
                                                            }}
                                                            className="w-full bg-brand-cream/50 p-3 text-xs font-bold rounded-sm border-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest block mb-2">Internal Pathway</label>
                                                        <input 
                                                            value={banner.link || ''}
                                                            onChange={e => {
                                                                const nb = [...banners];
                                                                nb[index] = { ...nb[index], link: e.target.value };
                                                                updateBanners(nb);
                                                            }}
                                                            placeholder="/product/..."
                                                            className="w-full bg-brand-cream/50 p-3 text-xs font-bold rounded-sm border-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 border-t border-brand-charcoal/5 pt-6">
                                                <div className="flex items-center space-x-2 bg-brand-rose/10 px-4 py-2 rounded-full">
                                                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-widest">Calibration:</span>
                                                    <span className="text-[10px] font-bold text-brand-charcoal uppercase tracking-widest">
                                                        {Math.round((banner.zoom || 1) * 100)}% / {Math.round(banner.translateX || 0)}px, {Math.round(banner.translateY || 0)}px
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-8">
                        <div className="bg-white p-12 rounded-sm shadow-sm border border-[#CD664D]/10">
                            <div className="border-2 border-dashed border-[#CD664D]/20 rounded-sm p-12 text-center cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/jpeg,image/png" />
                                <Upload className="mx-auto mb-4" size={48} />
                                <h3 className="text-xl font-medium">Upload new identity</h3>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white p-8 rounded-sm shadow-sm border border-brand-charcoal/5 flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-xl">Order #{String(order.id || '').split('-').pop()?.toUpperCase() || 'NEW'}</h3>
                                    <p className="text-xs text-brand-charcoal/40">{order.customerName}</p>
                                </div>
                                <p className="font-medium text-xl">₹{order.total.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-4xl space-y-12">
                        <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <h3 className="text-[11px] font-medium text-brand-charcoal/40 mb-8">Base configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <input value={localSettings.shopName} onChange={e => setLocalSettings({...localSettings, shopName: e.target.value})} className="w-full bg-brand-cream p-4 font-medium text-xl border-none" />
                            </div>
                        </div>
                        <div className="flex justify-start pt-4 border-t border-brand-charcoal/5">
                            <button 
                                onClick={async () => {
                                    if(window.confirm("⚠ WARNING: This will permanently delete ALL local browser cache and reset the store interface. This action cannot be undone. Proceed?")) {
                                        localStorage.clear();
                                        window.location.reload();
                                    }
                                }}
                                className="bg-brand-rose/20 text-red-600 px-14 py-8 rounded-sm text-[18px] font-medium shadow-sm hover:bg-red-600 hover:text-white transition-all flex items-center space-x-4 border border-red-600/20"
                            >
                                <RefreshCcw size={20} />
                                <span>Factory Reset — Erase All Local Data</span>
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
            <AnimatePresence>
                {adjustingBannerIdx !== null && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setAdjustingBannerIdx(null)}
                            className="absolute inset-0 bg-brand-charcoal/95 backdrop-blur-2xl" 
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-[#F4F1EA] w-full max-w-7xl h-[85vh] rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row"
                        >
                            <button 
                                onClick={() => setAdjustingBannerIdx(null)} 
                                className="absolute top-6 right-6 p-4 bg-brand-charcoal text-white rounded-full hover:scale-110 transition-all z-50 shadow-2xl"
                            >
                                <X size={24} />
                            </button>

                            {/* Calibration Area */}
                            <div className="flex-grow bg-brand-cream relative overflow-hidden group cursor-move select-none">
                                <div 
                                    className="w-full h-full relative"
                                    onMouseDown={(e) => {
                                        const banner = banners[adjustingBannerIdx];
                                        setPanningPoint({
                                            x: e.clientX,
                                            y: e.clientY,
                                            origX: banner.translateX || 0,
                                            origY: banner.translateY || 0,
                                            containerW: e.currentTarget.clientWidth,
                                            containerH: e.currentTarget.clientHeight
                                        });
                                    }}
                                    onMouseMove={(e) => {
                                        if (!panningPoint) return;
                                        const dx = e.clientX - panningPoint.x;
                                        const dy = e.clientY - panningPoint.y;
                                        
                                        const nb = [...banners];
                                        nb[adjustingBannerIdx] = {
                                            ...nb[adjustingBannerIdx],
                                            translateX: panningPoint.origX + dx,
                                            translateY: panningPoint.origY + dy,
                                            refWidth: panningPoint.containerW,
                                            refHeight: panningPoint.containerH
                                        };
                                        updateBanners(nb);
                                    }}
                                    onMouseUp={() => setPanningPoint(null)}
                                    onMouseLeave={() => setPanningPoint(null)}
                                >
                                    <img 
                                        src={getProductImage(banners[adjustingBannerIdx].image, media)}
                                        className="absolute top-0 left-0 w-full h-full pointer-events-none origin-center"
                                        style={{
                                            transform: `translate(${banners[adjustingBannerIdx].translateX || 0}px, ${banners[adjustingBannerIdx].translateY || 0}px) scale(${banners[adjustingBannerIdx].zoom || 1})`,
                                            objectFit: banners[adjustingBannerIdx].fitMode || 'cover'
                                        }}
                                    />
                                    {/* Calibration Grid Overlay */}
                                    <div className="absolute inset-0 pointer-events-none border-[12px] border-[#CD664D]/10" />
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                        <div className="w-10 h-10 border border-[#CD664D]/20 rounded-full flex items-center justify-center">
                                            <div className="w-1 h-1 bg-[#CD664D] rounded-full" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                                        <div className="w-[1px] h-full bg-[#CD664D]" />
                                        <div className="h-[1px] w-full bg-[#CD664D]" />
                                    </div>
                                </div>
                                <div className="absolute bottom-8 left-8 bg-brand-charcoal/80 backdrop-blur-md text-white p-6 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] space-y-2 border border-white/10 shadow-2xl">
                                    <p className="flex justify-between gap-12">Offset X <span className="text-brand-rose">{Math.round(banners[adjustingBannerIdx].translateX || 0)}px</span></p>
                                    <p className="flex justify-between gap-12">Offset Y <span className="text-brand-rose">{Math.round(banners[adjustingBannerIdx].translateY || 0)}px</span></p>
                                    <p className="flex justify-between gap-12">Magnification <span className="text-brand-rose">{Math.round((banners[adjustingBannerIdx].zoom || 1) * 100)}%</span></p>
                                </div>
                            </div>

                            {/* Control Sidebar */}
                            <div className="w-full md:w-80 bg-white p-10 flex flex-col space-y-12">
                                <div>
                                    <h4 className="text-[12px] font-bold text-brand-charcoal/40 uppercase tracking-[0.3em] mb-8">Calibration Hub</h4>
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                                                <span>Magnification</span>
                                                <span className="text-brand-rose">{Math.round((banners[adjustingBannerIdx].zoom || 1) * 100)}%</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0.5" 
                                                max="4" 
                                                step="0.01" 
                                                value={banners[adjustingBannerIdx].zoom || 1}
                                                onChange={(e) => {
                                                    const nb = [...banners];
                                                    nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], zoom: parseFloat(e.target.value) };
                                                    updateBanners(nb);
                                                }}
                                                className="w-full accent-brand-charcoal"
                                            />
                                        </div>

                                        <div className="space-y-4 text-[11px] font-bold uppercase tracking-widest">
                                            <span>Composition Mode</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['cover', 'contain'].map(mode => (
                                                    <button 
                                                        key={mode}
                                                        onClick={() => {
                                                            const nb = [...banners];
                                                            nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], fitMode: mode };
                                                            updateBanners(nb);
                                                        }}
                                                        className={`p-3 border rounded-sm transition-all ${banners[adjustingBannerIdx].fitMode === mode || (!banners[adjustingBannerIdx].fitMode && mode === 'cover') ? 'bg-brand-charcoal text-white border-brand-charcoal' : 'text-brand-charcoal/40 hover:bg-brand-cream/50'}`}
                                                    >
                                                        {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => {
                                                const nb = [...banners];
                                                nb[adjustingBannerIdx] = { 
                                                    ...nb[adjustingBannerIdx], 
                                                    translateX: 0, 
                                                    translateY: 0, 
                                                    zoom: 1, 
                                                    fitMode: 'cover' 
                                                };
                                                updateBanners(nb);
                                            }}
                                            className="w-full p-4 border border-brand-charcoal text-brand-charcoal text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-brand-charcoal hover:text-white transition-all flex items-center justify-center gap-3"
                                        >
                                            <RefreshCcw size={14} />
                                            Reset Transformation
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-auto pt-10 border-t border-brand-charcoal/5">
                                    <button 
                                        onClick={() => setAdjustingBannerIdx(null)}
                                        className="w-full bg-brand-rose text-brand-charcoal py-5 text-[11px] font-bold uppercase tracking-[0.3em] rounded-sm shadow-xl hover:bg-white transition-all border border-transparent hover:border-brand-rose"
                                    >
                                        Synchronize
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default AdminDashboard;
