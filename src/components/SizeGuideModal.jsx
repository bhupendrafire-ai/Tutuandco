import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Sparkles } from 'lucide-react';
import { usePolicy, processDualUnits } from '../context/ShopContext';

/**
 * SizeGuideModal - A premium overlay for sizing information.
 * Features:
 * - Dynamic Dual-Unit Engine (Post-processing)
 * - Responsive table horizontal scroll
 * - Editorial typography
 */
const SizeGuideModal = ({ isOpen, onClose }) => {
    const { policy, loading } = usePolicy('sizing_guide');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 lg:p-8">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-brand-cream shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-brand-charcoal/5 bg-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-brand-sage/10 rounded-full flex items-center justify-center text-brand-charcoal">
                                <Ruler size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-medium text-brand-charcoal tracking-tight">
                                    {policy?.title || 'Sizing Guide'}
                                </h2>
                                <div className="flex items-center space-x-1.5 opacity-40">
                                    <Sparkles size={10} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Automated Conversion Active</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-brand-sage/10 rounded-full transition-all text-brand-charcoal/40 hover:text-brand-charcoal"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow overflow-y-auto p-8 lg:p-12">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-10 h-10 border-4 border-brand-charcoal/5 border-t-brand-rose rounded-full animate-spin" />
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-charcoal/30">Calibrating Measurements...</p>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none sizing-modal-content">
                                {policy?.content ? (
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: processDualUnits(policy.content) }} 
                                        className="text-brand-charcoal/80 leading-relaxed space-y-6"
                                    />
                                ) : (
                                    <div className="py-20 text-center text-brand-charcoal/40 italic">
                                        Sizing information is currently unavailable.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer / Tip */}
                    <div className="p-6 bg-brand-sage/10 border-t border-brand-charcoal/5">
                        <div className="flex items-start space-x-3">
                            <div className="text-brand-rose mt-0.5">
                                <Sparkles size={12} />
                            </div>
                            <p className="text-[11px] text-brand-charcoal/60 leading-relaxed">
                                <strong className="text-brand-charcoal">Pro Tip:</strong> Measure your pet's neck at the base where a collar would naturally sit. Keep two fingers between the tape and your pet for the most comfortable fit.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style sx>{`
                .sizing-modal-content {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                .sizing-modal-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 2rem 0;
                    font-size: 13px;
                }
                .sizing-modal-content th {
                    text-align: left;
                    padding: 1rem;
                    border-bottom: 2px solid rgba(0,0,0,0.05);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: rgba(0,0,0,0.4);
                }
                .sizing-modal-content td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                    color: #1a1a1a;
                }
                .sizing-modal-content tr:last-child td {
                    border-bottom: none;
                }
                .sizing-modal-content h2 {
                    font-size: 1.25rem;
                    color: #1a1a1a;
                    margin-bottom: 1rem;
                }
                
                @media (max-width: 768px) {
                    .sizing-modal-content table {
                        min-width: 500px;
                    }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default SizeGuideModal;
