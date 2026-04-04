import React, { useState, useRef, useEffect } from 'react';
import { 
    Package, Plus, Trash2, Edit3, X, Upload, Image as ImageIcon, 
    Settings, Crosshair, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { upload } from '@vercel/blob/client';
import { useShop, getProductImage, FINAL_API_URL } from '../../context/ShopContext';
import MediaPicker from '../../components/MediaPicker';

const AdminProducts = () => {
    const { 
        products, media, settings, updateSettings,
        addProduct, deleteProduct, updateProduct 
    } = useShop();

    const [isEditingProduct, setIsEditingProduct] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [isBulkDiscountModalOpen, setIsBulkDiscountModalOpen] = useState(false);
    const [bulkDiscountValue, setBulkDiscountValue] = useState(10);
    const [productForm, setProductForm] = useState({ 
        name: '', price: 0, discountPrice: null, stock: 0, 
        category: '', description: '', imageName: '',
        images: [], descriptionBlocks: [] 
    });

    const [mediaPickerConfig, setMediaPickerConfig] = useState({ isOpen: false, multi: false, onSelect: () => {}, selectedItems: [] });
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [adjustingImageIdx, setAdjustingImageIdx] = useState(null);
    
    const fileInputRef = useRef(null);
    const uploadTargetIdx = useRef(null);

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

    const handleFileUpload = async (e) => {
        let file = e.target.files[0];
        if (!file) return;

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: `${FINAL_API_URL}/api/upload`,
            });
            
            const targetIdx = uploadTargetIdx.current !== null ? uploadTargetIdx.current : (productForm.images || []).length;
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
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message || "Unknown error"}.`);
        }
    };

    const triggerUpload = (idx) => {
        uploadTargetIdx.current = idx;
        fileInputRef.current?.click();
    };

    const openMediaPicker = (config) => {
        setMediaPickerConfig({ ...config, isOpen: true });
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
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
                                        <img src={getProductImage(item.images?.[0]?.url || item.imageName, media)} className="w-24 h-24 object-cover rounded-sm border border-brand-charcoal/10 shadow-sm" alt="" />
                                        <span className="font-bold text-lg md:text-xl line-clamp-1">{item.name}</span>
                                    </td>
                                    <td className="p-6 text-sm">
                                        <span className={`px-4 py-1.5 text-[12px] font-bold rounded-full ${Number(item.stock) < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {Number(item.stock) || 0} units
                                        </span>
                                    </td>
                                    <td className="p-6 font-medium text-lg">{settings?.currency?.symbol || '₹'}{Number(item.price || 0).toFixed(2)}</td>
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

            {/* Bulk Discount / Batch Actions Bar */}
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

            {/* Product Edit Modal */}
            <AnimatePresence>
                {isEditingProduct && (
                    <div 
                        className="fixed inset-0 bg-[#3E362E]/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 md:p-12 cursor-pointer"
                        onClick={() => setIsEditingProduct(null)}
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="bg-[#F4F1EA] w-full max-w-[1440px] h-[90vh] rounded-sm shadow-2xl overflow-hidden flex flex-col cursor-default relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setIsEditingProduct(null)} className="absolute top-4 right-4 p-2 bg-brand-charcoal text-white rounded-full hover:bg-black transition-all shadow-xl z-[200]"><X size={16} /></button>
                            <div className="bg-[#F4F1EA] border-b border-[#CD664D]/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <h2 className="text-2xl md:text-3xl font-medium text-brand-charcoal">
                                    {isEditingProduct === 'new' ? 'New creation' : `Refining: ${productForm.name}`}
                                </h2>
                            </div>
                            <div className="flex-grow overflow-y-auto flex flex-col md:flex-row custom-scrollbar">
                                {/* Media Hub Left Panel */}
                                <div className="w-full md:w-[45%] bg-[#F4F1EA]/60 border-r border-brand-charcoal/5 flex flex-col p-6 md:p-10">
                                    <h3 className="text-[12px] font-bold text-brand-charcoal/70 uppercase tracking-widest mb-6">Media Hub</h3>
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        {[0, 1, 2, 3].map((idx) => (
                                            <div key={idx} className="relative aspect-[4/5] rounded-sm border border-brand-charcoal/10 overflow-hidden group shadow-sm bg-white/50">
                                                {productForm.images?.[idx]?.url ? (
                                                    <>
                                                        <img src={getProductImage(productForm.images[idx].url, media)} className="w-full h-full object-cover" alt="" />
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

                                {/* Form Right Panel */}
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
                                                    <span className="text-xs opacity-40 block mb-1">Price ({settings?.currency?.symbol || '₹'})</span>
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
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Focal Point Calibration Modal */}
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
                                    alt=""
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

            {/* Category Manager Modal */}
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

export default AdminProducts;
