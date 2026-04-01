import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Upload, Check, ImageIcon } from 'lucide-react';
import { useShop, getProductImage, FINAL_API_URL } from '../context/ShopContext';
import { upload } from '@vercel/blob/client';

const MediaPicker = ({ isOpen, onClose, onSelect, multi = false, selectedItems = [] }) => {
    const { media, uploadMedia } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const [localSelected, setLocalSelected] = useState(multi ? selectedItems : (selectedItems[0] ? [selectedItems[0]] : []));
    const [isUploading, setIsUploading] = useState(false);


    const prevOpenRef = useRef(false);
    useEffect(() => {
        // ONLY reset internal selection when the window transitions from CLOSED to OPEN
        if (isOpen && !prevOpenRef.current) {
            setLocalSelected(multi ? (selectedItems || []) : ((selectedItems && selectedItems[0]) ? [selectedItems[0]] : []));
        }
        prevOpenRef.current = isOpen;
    }, [isOpen, selectedItems, multi]);

    const filteredMedia = media.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Static assets mapped from getProductImage resolution pool
    const staticAssets = ['IMG_6135', 'IMG_6137', 'IMG_6144', 'IMG_6154', 'IMG_6169', 'IMG_6214']
        .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(name => ({ id: name, name, url: getProductImage(name), isStatic: true }));

    const allAssets = [...staticAssets, ...filteredMedia];

    const toggleSelect = (item) => {
        const identifier = item.isStatic ? item.name : item.url;
        if (multi) {
            if (localSelected.includes(identifier)) {
                setLocalSelected(localSelected.filter(i => i !== identifier));
            } else {
                setLocalSelected([...localSelected, identifier]);
            }
        } else {
            // SINGLE SELECT: If already selected, clicking it again confirms.
            if (localSelected.includes(identifier)) {
                onSelect(identifier);
                onClose();
            } else {
                setLocalSelected([identifier]);
            }
        }
    };

    const handleFileUpload = async (e) => {
        let file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);

        // HEIC Support: Convert to JPEG on the fly
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
                setIsUploading(false);
                return;
            }
        }
        
        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: `${FINAL_API_URL}/api/upload`,
            });
            
            const newMedia = await uploadMedia(newBlob.url, file.name);
            if (!multi) {
                onSelect(newBlob.url);
                onClose();
            } else {
                setLocalSelected(prev => [...prev, newBlob.url]);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message || "Unknown error"}. Check server logs and environment variables (BLOB_READ_WRITE_TOKEN).`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleConfirm = () => {
        if (multi) {
            onSelect(localSelected);
        } else if (localSelected.length > 0) {
            onSelect(localSelected[0]);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-brand-charcoal/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-brand-cream w-full max-w-5xl h-[80vh] rounded-sm shadow-2xl flex flex-col overflow-hidden border border-brand-charcoal/10"
            >
                {/* Header */}
                <div className="p-6 border-b border-brand-charcoal/10 flex justify-between items-center bg-brand-cream">
                    <div>
                        <h2 className="text-2xl font-medium text-brand-charcoal">Media library</h2>
                        <p className="text-[10px] font-medium text-brand-charcoal/40">
                            {multi ? 'Select multiple assets' : 'Select an asset'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-brand-sage/50 rounded-full transition-colors text-brand-charcoal">
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-6 bg-brand-sage/50 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-brand-charcoal/5">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-charcoal/40" />
                        <input 
                            type="text" 
                            placeholder="Search assets..." 
                            className="w-full pl-12 pr-4 py-3 bg-brand-cream border border-brand-charcoal/10 rounded-sm text-sm focus:outline-none focus:border-brand-charcoal text-brand-charcoal"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <label className="flex-grow md:flex-initial flex items-center justify-center gap-2 bg-brand-charcoal text-white px-6 py-3 rounded-sm text-[11px] font-medium cursor-pointer hover:opacity-90 transition-all shadow-md">
                            {isUploading ? 'Uploading...' : <><Upload size={16} /> Upload New</>}
                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept="image/*" />
                        </label>
                        {multi && (
                            <button 
                                onClick={handleConfirm}
                                className="flex-grow md:flex-initial bg-brand-charcoal/80 text-white px-8 py-3 rounded-sm text-[11px] font-medium hover:bg-brand-charcoal transition-all shadow-md"
                            >
                                Confirm Selection ({localSelected.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {allAssets.map((item, idx) => {
                            const identifier = item.isStatic ? item.name : item.url;
                            const isSelected = localSelected.includes(identifier);
                            
                            return (
                                <div 
                                    key={idx}
                                    onClick={() => toggleSelect(item)}
                                    className={`group relative aspect-square bg-brand-sage/20 rounded-sm overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-brand-charcoal' : 'border-transparent hover:border-brand-charcoal/30'}`}
                                >
                                    <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                                    {item.isStatic && (
                                        <div className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 text-[8px] font-medium tracking-wide rounded-full">Static</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-[10px] font-medium text-center px-4 truncate w-full">{item.name}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-brand-charcoal text-white p-1 rounded-full shadow-lg">
                                            <Check size={12} />
                                        </div>
                                    )}
                                    {!multi && isSelected && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-charcoal/60 backdrop-blur-[2px] transition-all animate-in fade-in zoom-in duration-200">
                                            <div className="bg-white text-brand-charcoal px-4 py-2 rounded-sm text-[10px] font-bold uppercase shadow-2xl mb-2 flex items-center gap-2">
                                                <Check size={14} className="text-green-600" /> Selected
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                                                className="bg-brand-rose text-brand-charcoal px-8 py-3 rounded-sm text-[11px] font-bold uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                                            >
                                                Finalize Choice
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {allAssets.length === 0 && (
                            <div className="col-span-full py-20 text-center text-[#9FA993]">
                                <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium">No assets found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MediaPicker;
