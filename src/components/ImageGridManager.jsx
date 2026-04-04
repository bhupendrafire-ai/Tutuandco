import React, { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
    Maximize, Trash2, Crosshair, ImageIcon, 
    Upload, LayoutGrid, LayoutList, Columns
} from 'lucide-react';
import { getProductImage } from '../context/ShopContext';

/**
 * ImageGridManager - Premium Drag & Drop Rearrangement Tool
 * Features:
 * - Fluid Reordering with magnetic snapping
 * - Multiple Editorial Layouts (2-Col, 3-Col, Hero+Stack)
 * - Hero Calibration & Displacement
 */
const ImageGridManager = ({ images, onChange, onUpload, onMediaPicker, onCalibrate, media }) => {
    const [draggedId, setDraggedId] = useState(null);

    const handleReorder = (newOrder) => {
        // Keep only up to 4 images
        onChange(newOrder.slice(0, 4));
    };

    const removeImage = (idx) => {
        const newer = [...images];
        newer.splice(idx, 1);
        onChange(newer);
    };

    const maxSlots = 4;
    const currentImages = images.slice(0, maxSlots);

    return (
        <div className="space-y-6">
            {/* Header / Interaction hint */}
            <div className="flex items-center justify-between pb-4 border-b border-brand-charcoal/5">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Composition (2x2)</span>
                <p className="text-[9px] font-medium text-brand-charcoal/30 uppercase tracking-[0.2em]">Drag to reorder narrative flow</p>
            </div>

            {/* Draggable 2x2 Grid */}
            <Reorder.Group 
                axis="y" 
                values={currentImages} 
                onReorder={handleReorder}
                className="grid grid-cols-2 gap-4"
            >
                {currentImages.map((img, idx) => (
                    <Reorder.Item 
                        key={img.url || idx} 
                        value={img}
                        onDragStart={() => setDraggedId(img.url)}
                        onDragEnd={() => setDraggedId(null)}
                        className={`relative group aspect-[4/5] cursor-grab active:cursor-grabbing rounded-sm overflow-hidden border border-brand-charcoal/10 shadow-sm bg-white/50 transition-shadow duration-300 ${draggedId === img.url ? 'shadow-2xl z-50 scale-[1.02]' : ''}`}
                    >
                        <div className="absolute inset-0">
                            <img 
                                src={getProductImage(img.url, media)} 
                                className="w-full h-full object-cover select-none pointer-events-none" 
                                alt="" 
                            />
                            
                            {/* Premium Editorial Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">#{idx + 1} Slot</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                        className="text-red-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="mt-auto space-y-2">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onCalibrate(idx); }}
                                        className="w-full bg-white text-brand-charcoal py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl"
                                    >
                                        <Crosshair size={14} />
                                        <span>Calibration</span>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onMediaPicker(idx); }}
                                        className="w-full bg-brand-rose text-brand-charcoal py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-xl"
                                    >
                                        <ImageIcon size={14} />
                                        <span>Replace</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}

                {/* Empty Slots - Exactly up to 4 */}
                {currentImages.length < maxSlots && [...Array(maxSlots - currentImages.length)].map((_, i) => (
                    <motion.div 
                        key={`empty-${i}`}
                        className="aspect-[4/5] rounded-sm border-2 border-dashed border-brand-charcoal/10 flex flex-col items-center justify-center space-y-4 hover:border-brand-rose transition-all group cursor-pointer bg-white/20"
                        onClick={() => onUpload(currentImages.length + i)}
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-charcoal/5 flex items-center justify-center group-hover:bg-brand-rose/20 transition-all">
                            <Upload size={18} className="text-brand-charcoal/30 group-hover:text-brand-rose transition-all" />
                        </div>
                        <div className="text-center">
                            <span className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest block">Slot {currentImages.length + i + 1}</span>
                            <span className="text-[8px] font-medium text-brand-charcoal/20 uppercase tracking-widest">Assign Asset</span>
                        </div>
                    </motion.div>
                ))}
            </Reorder.Group>

            {/* Empty State Instructions */}
            {images.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-brand-charcoal/10 rounded-sm">
                    <ImageIcon size={48} className="mx-auto mb-4 text-brand-charcoal/10" />
                    <h4 className="text-sm font-medium text-brand-charcoal/40">Initialize Narrative Density</h4>
                    <p className="text-xs text-brand-charcoal/30 mt-2">Upload or select heritage assets to begin</p>
                </div>
            )}
        </div>
    );
};

export default ImageGridManager;
