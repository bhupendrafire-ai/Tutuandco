import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';

const AdminSettings = () => {
    const { settings, updateSettings } = useShop();
    const [localSettings, setLocalSettings] = useState(settings);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const saveSettings = async () => {
        await updateSettings(localSettings);
        alert("Universal settings synchronized!");
    };

    return (
        <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5">
                <h3 className="text-[11px] font-medium text-brand-charcoal/40 mb-8 uppercase tracking-widest">Store Taxonomy & Logistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Master Shop Name</label>
                        <input 
                            value={localSettings.shopName || ''} 
                            onChange={e => setLocalSettings({...localSettings, shopName: e.target.value})} 
                            className="w-full bg-brand-cream p-4 font-medium text-xl border-none outline-none focus:ring-1 focus:ring-brand-rose" 
                        />
                    </div>
                    <div className="flex gap-4 items-end">
                        <button 
                            onClick={() => setShowCategoryManager(true)} 
                            className="flex-grow bg-brand-charcoal text-white p-5 rounded-sm font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all"
                        >
                            Manage Categories
                        </button>
                        <button 
                            onClick={saveSettings} 
                            className="px-10 py-5 bg-brand-rose text-brand-charcoal font-bold uppercase tracking-widest text-[11px] hover:bg-white transition-all shadow-lg"
                        >
                            Save Settings
                        </button>
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

            {/* Category Manager Modal (Shared logic with Products but duplicated for settings focus) */}
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
        </div>
    );
};

export default AdminSettings;
