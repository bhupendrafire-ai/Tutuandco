import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, Package, ShoppingCart, Settings, 
    LogOut, Plus, Trash2, Edit3, 
    X, Upload, Check, AlertCircle, 
    FileText, CheckCircle, Printer, RefreshCcw, Truck,
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
        addProduct, deleteProduct, updateProduct, updateBanners, uploadMedia,
        shipOrder
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
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [shippingForm, setShippingForm] = useState({ tracking_number: '', carrier: '' });
    const previewContainerRef = useRef(null);
    const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 });
    const [isSyncing, setIsSyncing] = useState(false);
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
            setSelectedProductIds((Array.isArray(products) ? products : []).map(p => p.id));
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

    const handleSaveProduct = async () => {
        if (!productForm.name) return alert("Product needs a title!");
        try {
            if (isEditingProduct === 'new') {
                await addProduct(productForm);
                alert("New creation birthed into inventory!");
            } else {
                await updateProduct(isEditingProduct, productForm);
                alert("Creation refined successfully!");
            }
            setIsEditingProduct(null);
        } catch (err) {
            console.error("Save failed:", err);
            alert("Sync error. Check connection.");
        }
    };

    const handlePanning = (e) => {
        if (!panningPoint || adjustingBannerIdx === null || !previewSize.w) return;
        const b = banners[adjustingBannerIdx];
        const rect = e.currentTarget.getBoundingClientRect();
        
        // Use reference dimensions (1920x1080) for universal calibration
        const refW = b.refWidth || 1920;
        const refH = b.refHeight || 1080;
        
        const deltaX = (e.clientX - panningPoint.x) / (rect.width / refW);
        const deltaY = (e.clientY - panningPoint.y) / (rect.height / refH);
        
        const nb = [...banners];
        nb[adjustingBannerIdx] = { 
            ...nb[adjustingBannerIdx], 
            translateX: (nb[adjustingBannerIdx].translateX || 0) + deltaX,
            translateY: (nb[adjustingBannerIdx].translateY || 0) + deltaY
        };
        
        setPanningPoint({ x: e.clientX, y: e.clientY });
        updateBanners(nb);
    };

    const handleFocalPointChange = (e) => {
        if (adjustingImageIdx === null) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const nb = [...(productForm.images || [])];
        nb[adjustingImageIdx] = { ...nb[adjustingImageIdx], focalPoint: { x, y } };
        setProductForm({ ...productForm, images: nb });
    };

    const saveCalibration = async () => {
        setIsSyncing(true);
        try {
            await updateBanners(banners, true);
            setAdjustingBannerIdx(null);
            alert("Universal identity state synchronized successfully!");
        } catch (err) {
            alert("Digital sync failed. Check connection.");
        } finally {
            setIsSyncing(false);
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
                        {/* Stats Logic with safety */}
                        {(() => {
                            const stats_grid = [
                                { label: 'Total Sales', val: `$${(Number(stats.totalSales) || 0).toLocaleString()}`, trend: '+12.5%', icon: DollarSign, color: '#CD664D' },
                                { label: 'Active Orders', val: Number(stats.totalOrders) || 0, trend: '+4 today', icon: ShoppingCart, color: '#9FA993' },
                                { label: 'Customers', val: Number(stats.totalCustomers) || 0, trend: '+18%', icon: Users, color: '#DED6C4' },
                                { label: 'Site Health', val: `${Number(stats.health) || 0}%`, trend: 'Optimal', icon: TrendingUp, color: '#3E362E' }
                            ];
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {(Array.isArray(stats_grid) ? stats_grid : []).map((stat, i) => (
                                        <div key={i} className="bg-brand-cream p-8 rounded-sm shadow-sm border-b-4" style={{ borderColor: stat.color === '#CD664D' ? '#3B3B3B' : (stat.color === '#9FA993' ? '#8C916C' : stat.color) }}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3 bg-brand-sage/50 rounded-sm text-brand-charcoal">
                                                    {stat.icon && <stat.icon size={24} />}
                                                </div>
                                                <span className="text-[12px] font-bold text-green-700">{stat.trend}</span>
                                            </div>
                                            <p className="text-[13px] font-bold text-brand-charcoal/60 mb-1">{stat.label}</p>
                                            <h3 className="text-3xl font-medium text-brand-charcoal">{stat.val}</h3>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}

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
                                                    checked={Array.isArray(products) && products.length > 0 && selectedProductIds.length === products.length}
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
                                        {(Array.isArray(products) ? products : []).map((item) => (
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
                                                    <span className={`px-4 py-1.5 text-[12px] font-bold rounded-full ${Number(item.stock) < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                        {Number(item.stock) || 0} units
                                                    </span>
                                                </td>
                                                <td className="p-6 font-medium text-lg">₹{Number(item.price || 0).toFixed(2)}</td>
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
                                        <div className="w-full md:w-[45%] bg-[#F4F1EA]/60 border-r border-brand-charcoal/5 flex flex-col p-6 md:p-10">
                                            <h3 className="text-[12px] font-bold text-brand-charcoal/70 uppercase tracking-widest mb-6">Media Hub</h3>
                                            <div className="grid grid-cols-2 gap-4 mb-8">
                                                {[0, 1, 2, 3].map((idx) => (
                                                    <div key={idx} className="relative aspect-[4/5] rounded-sm border border-brand-charcoal/10 overflow-hidden group shadow-sm bg-white/50">
                                                        {productForm.images?.[idx]?.url ? (
                                                            <>
                                                                <img src={getProductImage(productForm.images[idx].url, media)} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col p-2 space-y-2">
                                                                    <button onClick={() => setAdjustingImageIdx(idx)} className="bg-white text-brand-charcoal p-2 rounded-sm text-[10px] font-bold uppercase"><Crosshair size={14} className="inline mr-2" /> Calibration</button>
                                                                    <button onClick={() => {
                                                                        openMediaPicker({
                                                                            multi: false,
                                                                            onSelect: (item) => {
                                                                                const url = typeof item === 'string' ? item : item.url;
                                                                                const ni = [...productForm.images];
                                                                                ni[idx] = { ...ni[idx], url };
                                                                                setProductForm({ ...productForm, images: ni });
                                                                            }
                                                                        });
                                                                    }} className="bg-brand-rose text-brand-charcoal p-2 rounded-sm text-[10px] font-bold uppercase">Replace</button>
                                                                    <button onClick={() => {
                                                                        const ni = productForm.images.filter((_, i) => i !== idx);
                                                                        setProductForm({...productForm, images: ni});
                                                                    }} className="bg-red-500 text-white p-2 rounded-sm text-[10px] font-bold uppercase">Purge</button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                                <div className="flex flex-col gap-2 w-full">
                                                                    <button 
                                                                        onClick={() => triggerUpload(idx)} 
                                                                        className="w-full py-3 bg-brand-charcoal/5 hover:bg-brand-sage text-brand-charcoal rounded-sm flex flex-col items-center justify-center transition-all"
                                                                    >
                                                                        <Upload size={16} className="mb-1" />
                                                                        <span className="text-[9px] font-bold uppercase">Upload</span>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            openMediaPicker({
                                                                                multi: false,
                                                                                onSelect: (item) => {
                                                                                    const url = typeof item === 'string' ? item : item.url;
                                                                                    const ni = [...(productForm.images || [])];
                                                                                    ni[idx] = { url, fitMode: 'cover', focalPoint: { x: 50, y: 50 } };
                                                                                    setProductForm({ ...productForm, images: ni });
                                                                                }
                                                                            });
                                                                        }} 
                                                                        className="w-full py-3 bg-brand-rose text-brand-charcoal rounded-sm flex flex-col items-center justify-center transition-all shadow-sm"
                                                                    >
                                                                        <ImageIcon size={16} className="mb-1" />
                                                                        <span className="text-[9px] font-bold uppercase">Library</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <h3 className="text-[12px] font-bold text-brand-charcoal/70 uppercase tracking-widest mb-4">Narrative Blocks</h3>
                                                <div className="space-y-4">
                                                    {(productForm.descriptionBlocks || []).map((block, idx) => (
                                                        <div key={idx} className="bg-white p-4 rounded-sm border border-brand-charcoal/5 group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-[10px] font-bold uppercase opacity-30">Block {idx + 1}</span>
                                                                <button onClick={() => {
                                                                    const nb = productForm.descriptionBlocks.filter((_, i) => i !== idx);
                                                                    setProductForm({...productForm, descriptionBlocks: nb});
                                                                }} className="text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                                                            </div>
                                                            <input value={block.title} onChange={e => {
                                                                const nb = [...productForm.descriptionBlocks];
                                                                nb[idx] = {...nb[idx], title: e.target.value};
                                                                setProductForm({...productForm, descriptionBlocks: nb});
                                                            }} className="w-full font-bold text-sm mb-2 outline-none border-none p-0" placeholder="Block Title" />
                                                            <textarea value={block.content} onChange={e => {
                                                                const nb = [...productForm.descriptionBlocks];
                                                                nb[idx] = {...nb[idx], content: e.target.value};
                                                                setProductForm({...productForm, descriptionBlocks: nb});
                                                            }} className="w-full text-xs opacity-60 outline-none border-none p-0 resize-none h-20" placeholder="Narrative content..." />
                                                        </div>
                                                    ))}
                                                    <button onClick={() => setProductForm({...productForm, descriptionBlocks: [...(productForm.descriptionBlocks || []), { title: '', content: '' }]})} className="w-full py-4 border-2 border-dashed border-brand-charcoal/10 rounded-sm text-[11px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">+ Add Block</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-[55%] flex flex-col p-6 md:p-10 space-y-10">
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Base Identity</label>
                                                <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-brand-cream/50 p-6 font-medium text-3xl border-none rounded-sm outline-none" placeholder="Master Title" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Inventory Status</label>
                                                    <div className="flex items-center space-x-6">
                                                        <div className="flex-grow">
                                                            <span className="text-xs opacity-40 block mb-1">Units In stock</span>
                                                            <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full bg-brand-cream/20 p-4 rounded-sm text-2xl font-medium outline-none" />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <span className="text-xs opacity-40 block mb-1">Price (₹)</span>
                                                            <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseInt(e.target.value)})} className="w-full bg-brand-charcoal text-white p-4 rounded-sm text-2xl font-medium outline-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Store Taxonomy</label>
                                                    <div className="relative">
                                                        <select 
                                                            value={productForm.category} 
                                                            onChange={e => setProductForm({...productForm, category: e.target.value})}
                                                            className="w-full bg-brand-cream/50 p-4 rounded-sm font-bold text-sm appearance-none border-none outline-none"
                                                        >
                                                            <option value="">Select Category</option>
                                                            {(settings.categories || []).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                        </select>
                                                        <button onClick={() => setShowCategoryManager(true)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-rose hover:scale-110 transition-all"><Settings size={18} /></button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Core Narrative</label>
                                                <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows="6" className="w-full bg-white p-8 text-lg font-medium border-none rounded-sm shadow-sm outline-none resize-none" placeholder="The story of this product..." />
                                            </div>

                                            <div className="pt-10 border-t border-brand-charcoal/5">
                                                <button 
                                                    onClick={handleSaveProduct}
                                                    className="w-full bg-brand-rose text-brand-charcoal py-6 rounded-sm text-[13px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-white transition-all transform active:scale-95"
                                                >
                                                    {isEditingProduct === 'new' ? 'Initialize Inventory' : 'Synchronize Product Changes'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'product_image')} />
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
                             {(Array.isArray(banners) ? banners : []).map((banner, index) => (
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
                                                            onSelect: (item) => {
                                                                const nb = [...banners];
                                                                nb[index] = { ...nb[index], image: typeof item === 'string' ? item : item.url };
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
                                                            list="product-paths"
                                                            value={banner.link || ''}
                                                            onChange={e => {
                                                                const nb = [...banners];
                                                                nb[index] = { ...nb[index], link: e.target.value };
                                                                updateBanners(nb);
                                                            }}
                                                            placeholder="/product/..."
                                                            className="w-full bg-brand-cream/50 p-3 text-xs font-bold rounded-sm border-none"
                                                        />
                                                        <datalist id="product-paths">
                                                            <option value="/" />
                                                            <option value="/blogs" />
                                                            <option value="/collab" />
                                                            <option value="/sizing" />
                                                            <option value="/moments" />
                                                            {(Array.isArray(products) ? products : []).map(p => (
                                                                <option key={p.id} value={`/product/${p.id}`}>{p.name} (₹{p.price})</option>
                                                            ))}
                                                        </datalist>
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
                    <div className="space-y-8">
                        <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-medium">Customer Transactions</h2>
                                <div className="flex items-center space-x-2 text-brand-charcoal/40 text-[11px] font-bold uppercase tracking-widest">
                                    <ShoppingCart size={14} />
                                    <span>{orders.length} Total Orders</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-[0.2em] border-b border-brand-charcoal/5">
                                            <th className="pb-6 pr-6">Order ID</th>
                                            <th className="pb-6 pr-6">Customer</th>
                                            <th className="pb-6 pr-6">Status</th>
                                            <th className="pb-6 pr-6">Date</th>
                                            <th className="pb-6 pr-6">Amount</th>
                                            <th className="pb-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-charcoal/5">
                                        {orders.map((order) => {
                                            const statusColors = {
                                                'Pending': 'bg-brand-rose/10 text-brand-rose',
                                                'Shipped': 'bg-blue-100 text-blue-700',
                                                'Delivered': 'bg-green-100 text-green-700',
                                                'Cancelled': 'bg-gray-100 text-gray-500'
                                            };
                                            return (
                                                <tr key={order.id} className="group hover:bg-brand-sage/5 transition-colors">
                                                    <td className="py-6 pr-6 font-bold text-[13px]">
                                                        #{String(order.id).padStart(4, '0')}
                                                    </td>
                                                    <td className="py-6 pr-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-brand-charcoal">{order.customer_name || 'Guest User'}</span>
                                                            <span className="text-[11px] text-brand-charcoal/40">{order.customer_email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-6 pr-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[order.status] || 'bg-gray-100'}`}>
                                                            {order.status || 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 pr-6 text-sm text-brand-charcoal/60">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-6 pr-6 text-lg font-medium">
                                                        ₹{parseFloat(order.total_amount || 0).toFixed(2)}
                                                    </td>
                                                    <td className="py-6 text-right">
                                                        <button 
                                                            onClick={() => setSelectedOrder(order)}
                                                            className="px-6 py-2 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-brand-rose transition-all shadow-md group-hover:scale-105"
                                                        >
                                                            Inspect
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="py-20 text-center text-brand-charcoal/20 font-bold uppercase tracking-widest">
                                                    No orders found in database.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-4xl space-y-12">
                        <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <h3 className="text-[11px] font-medium text-brand-charcoal/40 mb-8 uppercase tracking-widest">Store Taxonomy & Logistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Master Shop Name</label>
                                    <input value={localSettings.shopName} onChange={e => setLocalSettings({...localSettings, shopName: e.target.value})} className="w-full bg-brand-cream p-4 font-medium text-xl border-none outline-none focus:ring-1 focus:ring-brand-rose" />
                                </div>
                                <div className="flex gap-4 items-end">
                                    <button onClick={() => setShowCategoryManager(true)} className="flex-grow bg-brand-charcoal text-white p-5 rounded-sm font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all">Manage Categories</button>
                                    <button onClick={saveSettings} className="px-10 py-5 bg-brand-rose text-brand-charcoal font-bold uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-lg">Save Settings</button>
                                </div>
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
                    <div className="fixed inset-0 z-[200] flex items-center justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAdjustingBannerIdx(null)} className="absolute inset-0 bg-brand-charcoal/95 backdrop-blur-2xl" />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }} 
                            className="relative w-[95vw] h-[85vh] bg-white rounded-sm overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Cinematic Ribbon: Top Control Bar */}
                            <div className="absolute top-0 left-0 right-0 z-50 bg-brand-charcoal/40 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center text-white">
                                <div className="flex items-center space-x-4">
                                    <h3 className="text-xl font-medium tracking-tight">Identity Panning Hub</h3>
                                    <div className="h-4 w-px bg-white/20 mx-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Storefront Mirror Mode</span>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-4 bg-brand-charcoal/80 px-6 py-2 rounded-full border border-white/10">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold uppercase opacity-40">Magnification</span>
                                            <span className="text-sm font-bold text-brand-rose">{Math.round((banners[adjustingBannerIdx].zoom || 1) * 100)}%</span>
                                        </div>
                                        <div className="h-6 w-px bg-white/20" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold uppercase opacity-40">Calibration</span>
                                            <span className="text-xs font-mono">{Math.round(banners[adjustingBannerIdx].translateX || 0)}X, {Math.round(banners[adjustingBannerIdx].translateY || 0)}Y</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={saveCalibration} 
                                        disabled={isSyncing}
                                        className={`bg-green-600 text-white px-8 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg active:scale-95 flex items-center space-x-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isSyncing ? <RefreshCcw size={14} className="animate-spin" /> : null}
                                        <span>{isSyncing ? 'Synchronizing...' : 'Save & Synchronize Identity'}</span>
                                    </button>
                                    <button onClick={() => setAdjustingBannerIdx(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>
                                </div>
                            </div>

                            {/* Full-width Mirror Container */}
                            <div className="flex-grow flex bg-brand-sage relative overflow-hidden group">
                                {/* Left Side: 65% Image (Storefront Mirror) */}
                                <div 
                                    ref={el => {
                                        if (el && (previewSize.w !== el.clientWidth || previewSize.h !== el.clientHeight)) {
                                            setPreviewSize({ w: el.clientWidth, h: el.clientHeight });
                                        }
                                    }}
                                    className="relative w-[65%] h-full overflow-hidden cursor-move select-none"
                                    onMouseDown={(e) => setPanningPoint({ x: e.clientX, y: e.clientY })}
                                    onMouseMove={handlePanning}
                                    onMouseUp={() => setPanningPoint(null)}
                                    onMouseLeave={() => setPanningPoint(null)}
                                >
                                    <img 
                                        src={getProductImage(banners[adjustingBannerIdx].image, media)} 
                                        className="w-full h-full block origin-center pointer-events-none" 
                                        draggable={false}
                                        style={{ 
                                            transform: (() => {
                                                const b = banners[adjustingBannerIdx];
                                                const ratioX = previewSize.w / (b.refWidth || 1920);
                                                const ratioY = previewSize.h / (b.refHeight || 1080);
                                                const tx = (b.translateX || 0) * ratioX;
                                                const ty = (b.translateY || 0) * ratioY;
                                                return `translate(${tx}px, ${ty}px) scale(${b.zoom || 1})`;
                                            })(),
                                            objectFit: banners[adjustingBannerIdx].fitMode || 'cover'
                                        }}
                                    />
                                    
                                    {/* Precision Crosshair */}
                                    <div className="absolute inset-0 pointer-events-none border-4 border-white/5 opacity-40" />
                                    <div className="absolute left-1/2 top-10 bottom-10 w-px bg-white/20 opacity-30" />
                                    <div className="absolute top-1/2 left-10 right-10 h-px bg-white/20 opacity-30" />
                                    
                                    {/* Natural Divider Mirror (Home.jsx parity) */}
                                    <div 
                                        className="absolute top-0 right-0 bottom-0 w-[10%] pointer-events-none z-10"
                                        style={{
                                            background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.08) 30%, rgba(0, 0, 0, 0.18) 55%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.4) 100%)'
                                        }}
                                    />
                                </div>

                                {/* Right Side: 35% Content Panel (Home.jsx parity) */}
                                <div className="w-[35%] bg-[#7C846C] p-20 flex flex-col justify-center text-white relative shadow-[-20px_0_40px_rgba(0,0,0,0.1)]">
                                    <div className="max-w-md w-full mx-auto md:mx-0 flex flex-col gap-y-8">
                                        <div className="space-y-4">
                                            <input 
                                                value={banners[adjustingBannerIdx].title || ""}
                                                onChange={e => {
                                                    const nb = [...banners];
                                                    nb[adjustingBannerIdx].title = e.target.value;
                                                    updateBanners(nb);
                                                }}
                                                placeholder="Narrative Title"
                                                className="w-full bg-transparent text-5xl md:text-6xl font-medium leading-[1.1] tracking-tight outline-none border-none placeholder:opacity-20"
                                            />
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <textarea 
                                                value={banners[adjustingBannerIdx].subtitle || ""}
                                                onChange={e => {
                                                    const nb = [...banners];
                                                    nb[adjustingBannerIdx].subtitle = e.target.value;
                                                    updateBanners(nb);
                                                }}
                                                placeholder="Supporting narrative..."
                                                className="w-full bg-transparent text-white/80 text-xl italic font-medium leading-relaxed outline-none border-none resize-none h-24 placeholder:opacity-20"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-y-8">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">CTA Label</label>
                                                    <input 
                                                        value={banners[adjustingBannerIdx].cta || ""}
                                                        onChange={e => {
                                                            const nb = [...banners];
                                                            nb[adjustingBannerIdx].cta = e.target.value;
                                                            updateBanners(nb);
                                                        }}
                                                        placeholder="Explore Collection"
                                                        className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold rounded-sm outline-none focus:border-brand-rose transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Pathway Hub</label>
                                                    <input 
                                                        list="product-paths"
                                                        value={banners[adjustingBannerIdx].link || ""}
                                                        onChange={e => {
                                                            const nb = [...banners];
                                                            nb[adjustingBannerIdx].link = e.target.value;
                                                            updateBanners(nb);
                                                        }}
                                                        placeholder="/product/..."
                                                        className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold rounded-sm outline-none focus:border-brand-rose transition-colors"
                                                    />
                                                    <datalist id="product-paths">
                                                        <option value="/" />
                                                        <option value="/blogs" />
                                                        <option value="/collab" />
                                                        <option value="/sizing" />
                                                        <option value="/moments" />
                                                        {(Array.isArray(products) ? products : []).map(p => (
                                                            <option key={p.id} value={`/product/${p.id}`}>{p.name} (₹{p.price})</option>
                                                        ))}
                                                    </datalist>
                                                </div>
                                            </div>

                                            <Link 
                                                to={banners[adjustingBannerIdx].link || "#"}
                                                target="_blank"
                                                className="bg-white/5 text-white/40 px-16 py-10 text-[18px] font-bold border border-white/10 uppercase tracking-[0.2em] inline-block text-center mr-auto active:scale-95 transition-all hover:bg-white hover:text-brand-charcoal cursor-pointer"
                                            >
                                                {banners[adjustingBannerIdx].cta || "Explore collection"}
                                            </Link>

                                            <div className="pt-8 border-t border-white/5 mt-auto">
                                                <button 
                                                    onClick={saveCalibration}
                                                    disabled={isSyncing}
                                                    className="w-full bg-brand-rose text-brand-charcoal py-6 rounded-sm text-[13px] font-bold uppercase tracking-[0.2em] shadow-2xl hover:bg-white transition-all transform active:scale-95 flex items-center justify-center space-x-3"
                                                >
                                                    {isSyncing ? <RefreshCcw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                    <span>{isSyncing ? 'Synchronizing State...' : 'SAVE ALL HUB CHANGES'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submerged Precision Controls */}
                                    <div className="absolute bottom-10 left-10 right-10 space-y-6 bg-brand-charcoal/20 p-8 rounded-sm backdrop-blur-sm border border-white/5 opacity-40 hover:opacity-100 transition-opacity">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Magnification</label>
                                            <span className="font-mono text-brand-rose font-bold">{Math.round((banners[adjustingBannerIdx].zoom || 1) * 100)}%</span>
                                        </div>
                                        <input 
                                            type="range" min="1" max="5" step="0.01"
                                            value={banners[adjustingBannerIdx].zoom || 1}
                                            onChange={e => {
                                                const nb = [...banners];
                                                nb[adjustingBannerIdx].zoom = parseFloat(e.target.value);
                                                updateBanners(nb);
                                            }}
                                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-rose mb-6"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => {
                                                    const nb = [...banners];
                                                    nb[adjustingBannerIdx].fitMode = 'cover';
                                                    updateBanners(nb);
                                                }}
                                                className={`py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${banners[adjustingBannerIdx].fitMode === 'cover' ? 'bg-brand-rose text-brand-charcoal' : 'bg-white/10 border border-white/10'}`}
                                            >
                                                Crop Fit
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    const nb = [...banners];
                                                    nb[adjustingBannerIdx].fitMode = 'contain';
                                                    updateBanners(nb);
                                                }}
                                                className={`py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${banners[adjustingBannerIdx].fitMode === 'contain' ? 'bg-brand-rose text-brand-charcoal' : 'bg-white/10 border border-white/10'}`}
                                            >
                                                Preserve
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                openMediaPicker({
                                                    multi: false,
                                                    onSelect: (item) => {
                                                        const url = typeof item === 'string' ? item : item.url;
                                                        const nb = [...banners];
                                                        nb[adjustingBannerIdx].image = url;
                                                        updateBanners(nb);
                                                    }
                                                });
                                            }}
                                            className="w-full py-4 mt-4 bg-white/10 border border-white/20 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-brand-rose hover:text-brand-charcoal transition-all"
                                        >
                                            Change Identity Asset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {adjustingImageIdx !== null && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAdjustingImageIdx(null)} className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-sm overflow-hidden shadow-2xl">
                            <div className="p-8 border-b flex justify-between items-center bg-brand-cream/30">
                                <h3 className="text-xl font-medium">Fine-Tune Focal Point</h3>
                                <button onClick={() => setAdjustingImageIdx(null)} className="p-2 hover:bg-white rounded-full transition-all"><X size={20} /></button>
                            </div>
                            <div 
                                className="relative aspect-square cursor-crosshair group overflow-hidden bg-brand-cream"
                                onClick={handleFocalPointChange}
                            >
                                <img 
                                    src={getProductImage(productForm.images[adjustingImageIdx].url, media)} 
                                    className="w-full h-full object-cover transition-all duration-500" 
                                    style={{ objectPosition: `${productForm.images[adjustingImageIdx].focalPoint?.x || 50}% ${productForm.images[adjustingImageIdx].focalPoint?.y || 50}%` }}
                                />
                                <div className="absolute inset-0 pointer-events-none bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center bg-white/20">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                </div>
                                <div 
                                    className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ left: `${productForm.images[adjustingImageIdx].focalPoint?.x || 50}%`, top: `${productForm.images[adjustingImageIdx].focalPoint?.y || 50}%` }}
                                >
                                    <div className="w-full h-full border-4 border-brand-rose rounded-full shadow-[0_0_20px_rgba(205,102,77,0.5)] animate-pulse" />
                                </div>
                            </div>
                            <div className="p-8 bg-brand-cream/10 border-t flex justify-between items-center">
                                <p className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Universal focal offset synchronized</p>
                                <button onClick={() => setAdjustingImageIdx(null)} className="bg-brand-charcoal text-white px-10 py-3 rounded-sm font-bold uppercase tracking-widest text-[11px] shadow-xl hover:bg-black transition-all">Dismiss</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-12 overflow-hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-brand-charcoal/90 backdrop-blur-md" />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                            className="relative bg-white w-full max-w-5xl h-[90vh] rounded-sm overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-brand-charcoal/10 flex justify-between items-center bg-brand-cream/30">
                                <div>
                                    <h3 className="text-2xl font-medium text-brand-charcoal">Order Details</h3>
                                    <p className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest mt-1">Order ID: #{String(selectedOrder.id).padStart(4, '0')} • Internal Record</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => window.print()} className="p-3 bg-brand-sage/20 rounded-full hover:bg-brand-sage transition-all text-brand-charcoal"><Printer size={20} /></button>
                                    <button onClick={() => setSelectedOrder(null)} className="p-3 bg-brand-charcoal text-white rounded-full hover:scale-110 transition-all shadow-xl"><X size={20} /></button>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto p-12 space-y-12 print:p-0">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Customer Info</h4>
                                        <div className="space-y-1">
                                            <p className="font-bold text-lg">{selectedOrder.customer_name}</p>
                                            <p className="text-sm opacity-60 font-medium">{selectedOrder.customer_email}</p>
                                            <p className="text-sm opacity-60 font-medium">{selectedOrder.customer_phone}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Shipping Address</h4>
                                        <div className="space-y-1 text-sm font-medium opacity-80 leading-relaxed uppercase tracking-tight">
                                            <p>{selectedOrder.shipping_address?.address}</p>
                                            <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state}</p>
                                            <p>{selectedOrder.shipping_address?.zip}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Order Status</h4>
                                        <div className="flex flex-col gap-2">
                                            <span className={`px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest text-center ${selectedOrder.status === 'Shipped' ? 'bg-blue-600 text-white' : 'bg-brand-rose text-brand-charcoal'}`}>
                                                {selectedOrder.status}
                                            </span>
                                            <p className="text-[10px] text-center font-bold opacity-30 uppercase tracking-[0.2em]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Line Items</h4>
                                    <div className="border border-brand-charcoal/5 rounded-sm overflow-hidden">
                                        {(() => {
                                            const items = Array.isArray(selectedOrder.items) ? selectedOrder.items : [];
                                            return items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-6 p-6 border-b border-brand-charcoal/5 last:border-0 bg-brand-cream/5">
                                                    <div className="w-20 h-24 bg-white rounded-sm overflow-hidden shadow-sm flex-shrink-0">
                                                        <img src={getProductImage(Array.isArray(item.images) ? item.images[0]?.url : item.imageName, media)} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h5 className="font-bold text-brand-charcoal">{item.name}</h5>
                                                        <p className="text-[11px] text-brand-charcoal/40 font-medium uppercase tracking-widest">{item.category} • SKU: {String(item.id).substring(0, 8)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest mb-1">Qty {item.quantity || 1}</p>
                                                        <p className="font-bold text-brand-charcoal">₹{(parseFloat(item.discountPrice || item.price) || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-brand-cream/20 p-10 rounded-sm">
                                    <div className="space-y-8">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-2">
                                            <Truck size={14} /> 
                                            Shipping Management
                                        </h4>
                                        {selectedOrder.status === 'Pending' ? (
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">Logistics Carrier</label>
                                                    <input 
                                                        list="carriers-list"
                                                        value={shippingForm.carrier}
                                                        onChange={e => setShippingForm({ ...shippingForm, carrier: e.target.value })}
                                                        placeholder="Enter or select carrier..."
                                                        className="w-full p-4 bg-white border border-brand-charcoal/10 rounded-sm text-sm focus:border-brand-rose outline-none font-bold"
                                                    />
                                                    <datalist id="carriers-list">
                                                        {(settings.carriers || ["FedEx", "Delhivery", "BlueDart", "DTDC"]).map(c => <option key={c} value={c} />)}
                                                    </datalist>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[11px] font-bold uppercase tracking-widest opacity-60">AWB / Tracking Number</label>
                                                    <input 
                                                        value={shippingForm.tracking_number}
                                                        onChange={e => setShippingForm({ ...shippingForm, tracking_number: e.target.value })}
                                                        placeholder="Paste tracking number here..."
                                                        className="w-full p-4 bg-white border border-brand-charcoal/10 rounded-sm text-sm focus:border-brand-rose outline-none font-bold"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={async () => {
                                                        if (!shippingForm.carrier || !shippingForm.tracking_number) return alert("Please enter carrier and tracking info");
                                                        const res = await shipOrder(selectedOrder.id, shippingForm);
                                                        if (res) {
                                                            setSelectedOrder(null);
                                                            alert(`Order #${selectedOrder.id} dispatched! Notification sent to customer.`);
                                                            window.location.reload();
                                                        }
                                                    }}
                                                    className="w-full bg-brand-charcoal text-white py-5 rounded-sm font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all shadow-xl"
                                                >
                                                    Dispatch Order & Notify Customer
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-blue-600/5 border border-blue-600/20 rounded-sm space-y-3">
                                                <p className="text-blue-700 text-sm font-bold">This shipment is currently in transit.</p>
                                                <div className="text-[11px] font-medium text-blue-600 space-y-1">
                                                    <p>Carrier: <span className="font-bold">{selectedOrder.carrier}</span></p>
                                                    <p>Tracking: <span className="font-bold">{selectedOrder.tracking_number}</span></p>
                                                    <p>Dispatched: <span className="font-bold">{new Date(selectedOrder.shipped_at).toLocaleString()}</span></p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white p-8 rounded-sm shadow-sm h-fit">
                                        <h4 className="text-[11px] font-bold text-brand-charcoal/40 uppercase tracking-widest mb-6 border-b border-brand-charcoal/5 pb-4">Financial Summary</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm opacity-60 font-medium"><span>Subtotal</span><span>₹{parseFloat(selectedOrder.total_amount - selectedOrder.shipping_cost).toFixed(2)}</span></div>
                                            <div className="flex justify-between text-sm opacity-60 font-medium"><span>Shipping</span><span>₹{parseFloat(selectedOrder.shipping_cost).toFixed(2)}</span></div>
                                            <div className="flex justify-between text-lg font-bold text-brand-charcoal pt-4 border-t border-brand-charcoal/10"><span>Total Paid</span><span>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <style dangerouslySetInnerHTML={{ __html: `
                            @media print {
                                body * { visibility: hidden; }
                                .print\\:hidden { display: none !important; }
                                .fixed { position: static !important; }
                                .relative { position: static !important; }
                                .shadow-2xl, .shadow-xl, .shadow-sm { box-shadow: none !important; }
                                .bg-white { background: white !important; }
                                .bg-brand-cream\\/30, .bg-brand-cream\\/20, .bg-brand-cream\\/5 { background: transparent !important; }
                                .p-4, .p-8, .p-12 { padding: 0 !important; }
                                .max-w-5xl { max-width: 100% !important; }
                                .h-\\[90vh\\] { height: auto !important; }
                                .relative.bg-white { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
                                .relative.bg-white * { visibility: visible; }
                            }
                        `}} />
                    </div>
                )}
            </AnimatePresence>
        </main>
    </div>
    );
};

export default AdminDashboard;
