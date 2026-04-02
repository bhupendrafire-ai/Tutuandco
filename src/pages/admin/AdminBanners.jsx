import React, { useState, useRef, useEffect } from 'react';
import { 
    Plus, Trash2, Cloud, Image as ImageIcon, CheckCircle2, EyeOff, 
    X, Maximize, AlignLeft, RefreshCcw, Crosshair
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useShop, getProductImage } from '../../context/ShopContext';
import MediaPicker from '../../components/MediaPicker';

const AdminBanners = () => {
    const { banners, media, products, updateBanners } = useShop();
    const [adjustingBannerIdx, setAdjustingBannerIdx] = useState(null);
    const [panningPoint, setPanningPoint] = useState(null);
    const [mediaPickerConfig, setMediaPickerConfig] = useState({ isOpen: false, multi: false, onSelect: () => {}, selectedItems: [] });
    const [isSyncing, setIsSyncing] = useState(false);
    const previewContainerRef = useRef(null);
    const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 });

    const openMediaPicker = (config) => {
        setMediaPickerConfig({ ...config, isOpen: true });
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
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8 pb-8 border-b border-brand-charcoal/10">
                <div>
                    <p className="text-[10px] font-medium text-brand-charcoal/40 uppercase tracking-[0.2em] mb-1">Homepage Slideshow</p>
                    <h3 className="text-2xl font-medium text-brand-charcoal">Digital Identity Banners</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={async () => {
                            setIsSyncing(true);
                            try {
                                await updateBanners(banners, true);
                                alert("All banners synchronized successfully!");
                            } catch (err) {
                                alert("Failed to synchronize banners.");
                            } finally {
                                setIsSyncing(false);
                            }
                        }}
                        disabled={isSyncing}
                        className={`bg-brand-charcoal text-white px-8 py-4 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center space-x-3 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSyncing ? <RefreshCcw size={16} className="animate-spin" /> : <Cloud size={16} />}
                        <span>{isSyncing ? 'Syncing...' : 'Sync All Banners'}</span>
                    </button>
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
            </div>

            <div className="space-y-12">
                 {(Array.isArray(banners) ? banners : []).map((banner, index) => (
                    <div key={banner.id || index} className="bg-white rounded-sm shadow-xl border border-[#CD664D]/10 overflow-hidden mb-12 mx-4 md:mx-6">
                         <div className="flex flex-col md:flex-row">
                            {/* Banner Preview - Life-Size Proportion Mirror */}
                            <div className="w-full md:w-[65%] aspect-[16/9] bg-brand-cream relative group cursor-crosshair overflow-hidden">
                                {banner.image ? (
                                    <img 
                                        src={getProductImage(banner.image, media)} 
                                        className="w-full h-full object-cover transition-transform duration-500"
                                        style={{ 
                                            transform: `translate(${banner.translateX || 0}px, ${banner.translateY || 0}px) scale(${banner.zoom || 1})`,
                                            objectFit: banner.fitMode || 'cover'
                                        }}
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-brand-charcoal/20">
                                        <ImageIcon size={48} className="mb-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">No Asset Assigned</span>
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 bottom-0 w-[4%] pointer-events-none z-10"
                                    style={{
                                        background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(124, 132, 108, 0.08) 30%, rgba(124, 132, 108, 0.18) 55%, rgba(124, 132, 108, 0.3) 75%, rgba(124, 132, 108, 0.5) 100%)'
                                    }}
                                />
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
                            <div className="w-full md:w-[35%] p-10 space-y-8 flex flex-col justify-between bg-[#7C846C] text-white">
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

            {/* Panning Calibration Hub Modal */}
            <AnimatePresence>
                {adjustingBannerIdx !== null && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAdjustingBannerIdx(null)} className="absolute inset-0 bg-brand-charcoal/95 backdrop-blur-2xl" />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }} 
                            className="relative w-[95vw] max-w-[1440px] h-[85vh] bg-white rounded-sm overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="flex-shrink-0 bg-brand-charcoal/95 border-b border-white/10 px-8 py-3 flex justify-between items-center text-white">
                                <div className="flex items-center space-x-4">
                                    <h3 className="text-xl font-medium tracking-tight">Identity Panning Hub</h3>
                                    <div className="h-4 w-px bg-white/20 mx-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-rose">Mirror Mode: Proportion Locked</span>
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
                            
                            <div className="flex-grow flex flex-col lg:flex-row bg-brand-sage relative overflow-hidden group lg:h-[71.25vh] min-h-0">
                                <div 
                                    ref={el => {
                                        if (el && (previewSize.w !== el.clientWidth || previewSize.h !== el.clientHeight)) {
                                            setPreviewSize({ w: el.clientWidth, h: el.clientHeight });
                                        }
                                    }}
                                    className="relative w-full lg:w-[65%] h-[50vh] lg:h-full overflow-hidden cursor-move select-none"
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
                                        alt=""
                                    />
                                    <div className="absolute inset-0 pointer-events-none border-4 border-white/5 opacity-40" />
                                    <div className="absolute left-1/2 top-10 bottom-10 w-px bg-white/20 opacity-30" />
                                    <div className="absolute top-1/2 left-10 right-10 h-px bg-white/20 opacity-30" />
                                    <div 
                                        className="absolute top-0 right-0 bottom-0 w-[4%] pointer-events-none z-10 hidden lg:block"
                                        style={{
                                            background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(124, 132, 108, 0.08) 30%, rgba(124, 132, 108, 0.18) 55%, rgba(124, 132, 108, 0.3) 75%, rgba(124, 132, 108, 0.5) 100%)'
                                        }}
                                    />
                                </div>

                                <div className="w-full lg:w-[35%] h-full bg-[#7C846C] p-10 lg:p-16 flex flex-col text-white relative shadow-[-20px_0_40px_rgba(0,0,0,0.1)] overflow-y-auto">
                                    <div className="max-w-md w-full mx-auto lg:mx-0 flex flex-col gap-y-12">
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-3 mb-2 opacity-30">
                                                <AlignLeft size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Core Narrative</span>
                                            </div>
                                            <div className="space-y-6">
                                                <input 
                                                    value={banners[adjustingBannerIdx].title || ""}
                                                    onChange={e => {
                                                        const nb = [...banners];
                                                        nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], title: e.target.value };
                                                        updateBanners(nb);
                                                    }}
                                                    placeholder="Narrative Title"
                                                    className="w-full bg-transparent text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight outline-none border-none placeholder:opacity-20"
                                                />
                                                <textarea 
                                                    value={banners[adjustingBannerIdx].subtitle || ""}
                                                    onChange={e => {
                                                        const nb = [...banners];
                                                        nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], subtitle: e.target.value };
                                                        updateBanners(nb);
                                                    }}
                                                    placeholder="Supporting narrative..."
                                                    className="w-full bg-transparent text-white/80 text-lg italic font-medium leading-relaxed outline-none border-none resize-none h-24 placeholder:opacity-20"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-8 bg-black/10 rounded-sm space-y-6 border border-white/5">
                                            <div className="flex items-center space-x-3 mb-2 opacity-60">
                                                <Maximize size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Image Hub Controls</span>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase opacity-60">
                                                    <span>Magnification</span>
                                                    <span className="text-brand-rose">{Math.round((banners[adjustingBannerIdx].zoom || 1) * 100)}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="1" max="5" step="0.01"
                                                    value={banners[adjustingBannerIdx].zoom || 1}
                                                    onChange={e => {
                                                        const nb = [...banners];
                                                        nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], zoom: parseFloat(e.target.value) };
                                                        updateBanners(nb);
                                                    }}
                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-rose"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <button 
                                                    onClick={() => {
                                                        const nb = [...banners];
                                                        nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], fitMode: 'cover' };
                                                        updateBanners(nb);
                                                    }}
                                                    className={`py-3 text-[9px] font-bold uppercase tracking-widest rounded-sm border transition-all ${banners[adjustingBannerIdx].fitMode === 'cover' ? 'bg-white text-brand-charcoal border-white shadow-lg' : 'bg-transparent border-white/20 text-white hover:border-white'}`}
                                                >
                                                    Crop Fit
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const nb = [...banners];
                                                        nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], fitMode: 'contain' };
                                                        updateBanners(nb);
                                                    }}
                                                    className={`py-3 text-[9px] font-bold uppercase tracking-widest rounded-sm border transition-all ${banners[adjustingBannerIdx].fitMode === 'contain' ? 'bg-white text-brand-charcoal border-white shadow-lg' : 'bg-transparent border-white/20 text-white hover:border-white'}`}
                                                >
                                                    Preserve
                                                </button>
                                            </div>

                                            <button 
                                                onClick={() => {
                                                    openMediaPicker({
                                                        multi: false,
                                                        onSelect: (item) => {
                                                            const nb = [...banners];
                                                            nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], image: typeof item === 'string' ? item : item.url };
                                                            updateBanners(nb);
                                                        }
                                                    });
                                                }}
                                                className="w-full py-4 border-2 border-dashed border-white/10 rounded-sm text-[9px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <ImageIcon size={14} />
                                                <span>Change Identity Asset</span>
                                            </button>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="flex items-center space-x-3 mb-2 opacity-30">
                                                <Plus size={14} />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Digital Call to Action</span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Label</label>
                                                    <input 
                                                        value={banners[adjustingBannerIdx].cta || ""}
                                                        onChange={e => {
                                                            const nb = [...banners];
                                                            nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], cta: e.target.value };
                                                            updateBanners(nb);
                                                        }}
                                                        placeholder="Explore Collection..."
                                                        className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold rounded-sm outline-none focus:border-brand-rose transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Pathway Hub</label>
                                                    <input 
                                                        list="product-paths"
                                                        value={banners[adjustingBannerIdx].link || ""}
                                                        onChange={e => {
                                                            const nb = [...banners];
                                                            nb[adjustingBannerIdx] = { ...nb[adjustingBannerIdx], link: e.target.value };
                                                            updateBanners(nb);
                                                        }}
                                                        placeholder="/product/..."
                                                        className="w-full bg-white/5 border border-white/10 p-4 text-xs font-bold rounded-sm outline-none focus:border-brand-rose transition-colors"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block">Interactive Prototype</span>
                                                <Link 
                                                    to={banners[adjustingBannerIdx].link || "#"}
                                                    target="_blank"
                                                    className="w-full bg-brand-charcoal text-[#EADED0] px-16 py-8 text-[16px] font-bold shadow-2xl uppercase tracking-[0.2em] inline-block text-center active:scale-95 transition-all hover:bg-white hover:text-brand-charcoal cursor-pointer border border-transparent"
                                                >
                                                    {banners[adjustingBannerIdx].cta || "Test Call to Action"}
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-white/5 pb-20">
                                            <button 
                                                onClick={saveCalibration}
                                                disabled={isSyncing}
                                                className="w-full bg-brand-rose text-brand-charcoal py-6 rounded-sm text-[13px] font-bold uppercase tracking-[0.2em] shadow-2xl hover:bg-white transition-all transform active:scale-95 flex items-center justify-center space-x-3"
                                            >
                                                {isSyncing ? <RefreshCcw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                                <span>{isSyncing ? 'Synchronizing State...' : 'Commit All Identity Changes'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {mediaPickerConfig.isOpen && (
                    <MediaPicker 
                        {...mediaPickerConfig} 
                        onClose={() => setMediaPickerConfig(prev => ({ ...prev, isOpen: false }))} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminBanners;
