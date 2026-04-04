import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ShieldCheck, FileCheck } from 'lucide-react';
import PolicyEditor from '../../components/admin/PolicyEditor';
import { DEFAULT_POLICIES } from '../../context/ShopContext';

const AdminSettings = () => {
    const { settings, updateSettings } = useShop();
    const [localSettings, setLocalSettings] = useState(settings);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [policyChanges, setPolicyChanges] = useState({});
    const [saveStatus, setSaveStatus] = useState(null);
    const [activePolicyId, setActivePolicyId] = useState(null);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const saveSettings = async () => {
        setSaveStatus('saving');
        const now = new Date().toISOString();
        const settingsToSave = { ...localSettings };
        
        // Add timestamps and versioning for changed policies
        Object.keys(policyChanges).forEach(key => {
            if (policyChanges[key] !== settings[key]) {
                settingsToSave[`${key}_updatedAt`] = now;
                settingsToSave[`${key}_lastVersion`] = settings[key] || DEFAULT_POLICIES[key.replace('Policy', '')];
            }
        });

        await updateSettings(settingsToSave);
        setPolicyChanges({});
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
    };

    const handlePolicyChange = (key, val) => {
        setPolicyChanges(prev => ({ ...prev, [key]: val }));
        setLocalSettings(prev => ({ ...prev, [key]: val }));
    };

    const rollbackPolicy = (key) => {
        const dbValue = settings[key] || settings[`${key}_lastVersion`];
        handlePolicyChange(key, dbValue);
    };

    const resetPolicyToDefault = (key) => {
        const type = key.replace('Policy', '');
        const defaultValue = DEFAULT_POLICIES[type];
        handlePolicyChange(key, defaultValue);
    };

    const isPolicyDirty = (key) => {
        return policyChanges[key] !== undefined && policyChanges[key] !== settings[key];
    };

    const togglePolicySection = (id) => {
        setActivePolicyId(prev => prev === id ? null : id);
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
                            disabled={saveStatus === 'saving'}
                            className={`px-10 py-5 font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg flex items-center space-x-3 ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-brand-rose text-brand-charcoal hover:bg-white'}`}
                        >
                            {saveStatus === 'saving' ? (
                                <span>Synchronizing...</span>
                            ) : saveStatus === 'saved' ? (
                                <>
                                    <FileCheck size={16} />
                                    <span>Settings Saved</span>
                                </>
                            ) : (
                                <span>Save Settings</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Policies Management Section */}
            <div className="bg-white p-10 rounded-sm shadow-sm border border-brand-charcoal/5 space-y-10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-[11px] font-medium text-brand-charcoal/40 uppercase tracking-widest">Policies Management</h3>
                        <p className="text-[10px] text-brand-charcoal/30 mt-1">Directly edit legal content with design protection</p>
                    </div>
                    {Object.keys(policyChanges).length > 0 && (
                        <div className="flex items-center space-x-2 text-brand-rose animate-pulse">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Unsaved legal changes</span>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <PolicyEditor 
                        label="Shipping Policy"
                        value={localSettings.shippingPolicy || settings.shippingPolicy || DEFAULT_POLICIES.shipping}
                        onChange={(val) => handlePolicyChange('shippingPolicy', val)}
                        onRollback={() => rollbackPolicy('shippingPolicy')}
                        onReset={() => resetPolicyToDefault('shippingPolicy')}
                        hasUnsavedChanges={isPolicyDirty('shippingPolicy')}
                        isExpanded={activePolicyId === 'shipping'}
                        onToggle={() => togglePolicySection('shipping')}
                    />

                    <PolicyEditor 
                        label="Refund & Cancellation Policy"
                        value={localSettings.refundPolicy || settings.refundPolicy || DEFAULT_POLICIES.refund}
                        onChange={(val) => handlePolicyChange('refundPolicy', val)}
                        onRollback={() => rollbackPolicy('refundPolicy')}
                        onReset={() => resetPolicyToDefault('refundPolicy')}
                        hasUnsavedChanges={isPolicyDirty('refundPolicy')}
                        isExpanded={activePolicyId === 'refund'}
                        onToggle={() => togglePolicySection('refund')}
                    />

                    <PolicyEditor 
                        label="Privacy Policy"
                        value={localSettings.privacyPolicy || settings.privacyPolicy || DEFAULT_POLICIES.privacy}
                        onChange={(val) => handlePolicyChange('privacyPolicy', val)}
                        onRollback={() => rollbackPolicy('privacyPolicy')}
                        onReset={() => resetPolicyToDefault('privacyPolicy')}
                        hasUnsavedChanges={isPolicyDirty('privacyPolicy')}
                        isExpanded={activePolicyId === 'privacy'}
                        onToggle={() => togglePolicySection('privacy')}
                    />

                    <PolicyEditor 
                        label="Terms & Conditions"
                        value={localSettings.termsPolicy || settings.termsPolicy || DEFAULT_POLICIES.terms}
                        onChange={(val) => handlePolicyChange('termsPolicy', val)}
                        onRollback={() => rollbackPolicy('termsPolicy')}
                        onReset={() => resetPolicyToDefault('termsPolicy')}
                        hasUnsavedChanges={isPolicyDirty('termsPolicy')}
                        isExpanded={activePolicyId === 'terms'}
                        onToggle={() => togglePolicySection('terms')}
                    />
                </div>
                
                <div className="pt-6 border-t border-brand-charcoal/5 flex justify-end">
                    <button 
                        onClick={saveSettings} 
                        disabled={saveStatus === 'saving' || Object.keys(policyChanges).length === 0}
                        className={`px-12 py-5 font-bold uppercase tracking-widest text-[11px] transition-all shadow-xl rounded-sm ${saveStatus === 'saved' ? 'bg-green-500 text-white' : Object.keys(policyChanges).length > 0 ? 'bg-brand-charcoal text-white hover:bg-black' : 'bg-brand-charcoal/10 text-brand-charcoal/30 cursor-not-allowed'}`}
                    >
                        {saveStatus === 'saved' ? 'Changes Synchronized' : 'Commit Legal Changes'}
                    </button>
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
