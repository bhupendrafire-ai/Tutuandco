import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Upload, Check, ImageIcon } from 'lucide-react';
import { useShop, getProductImage } from '../context/ShopContext';
import { upload } from '@vercel/blob/client';

const MediaPicker = ({ isOpen, onClose, onSelect, multi = false, selectedItems = [] }) => {
    const { media, uploadMedia } = useShop();
    const [searchTerm, setSearchTerm] = useState('');
    const [localSelected, setLocalSelected] = useState(multi ? selectedItems : (selectedItems[0] ? [selectedItems[0]] : []));
    const [isUploading, setIsUploading] = useState(false);

    const FINAL_API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

    useEffect(() => {
        if (isOpen) {
            setLocalSelected(multi ? selectedItems : (selectedItems[0] ? [selectedItems[0]] : []));
        }
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
            setLocalSelected([identifier]);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setIsUploading(true);
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
            alert("Upload failed. Check console for details.");
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-[#3E362E]/80 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-5xl h-[80vh] rounded-sm shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-[#CD664D]/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-serif italic">Media Library</h2>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-[#9FA993]">
                            {multi ? 'Select Multiple Assets' : 'Select an Asset'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#F4F1EA] rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-6 bg-[#F4F1EA] flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3E362E]/40" />
                        <input 
                            type="text" 
                            placeholder="Search assets..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-[#CD664D]/10 rounded-sm text-sm focus:outline-none focus:border-[#CD664D]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <label className="flex-grow md:flex-initial flex items-center justify-center gap-2 bg-[#3E362E] text-white px-6 py-3 rounded-sm text-[10px] uppercase font-bold tracking-widest cursor-pointer hover:bg-[#CD664D] transition-all">
                            {isUploading ? 'Uploading...' : <><Upload size={16} /> Upload New</>}
                            <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept="image/*" />
                        </label>
                        {multi && (
                            <button 
                                onClick={handleConfirm}
                                className="flex-grow md:flex-initial bg-[#CD664D] text-white px-8 py-3 rounded-sm text-[10px] uppercase font-bold tracking-widest hover:bg-[#3E362E] transition-all"
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
                                    className={`group relative aspect-square bg-[#F4F1EA] rounded-sm overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-[#CD664D]' : 'border-transparent hover:border-[#CD664D]/30'}`}
                                >
                                    <img src={item.url} className="w-full h-full object-cover" alt={item.name} />
                                    {item.isStatic && (
                                        <div className="absolute top-2 left-2 bg-white/80 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full">Static</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white text-[10px] font-bold uppercase text-center px-4 truncate w-full">{item.name}</p>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-[#CD664D] text-white p-1 rounded-full shadow-lg">
                                            <Check size={12} />
                                        </div>
                                    )}
                                    {!multi && isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#CD664D]/20">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleConfirm(); }}
                                                className="bg-[#CD664D] text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest"
                                            >
                                                Select
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {allAssets.length === 0 && (
                            <div className="col-span-full py-20 text-center text-[#9FA993]">
                                <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-serif italic">No assets found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MediaPicker;
