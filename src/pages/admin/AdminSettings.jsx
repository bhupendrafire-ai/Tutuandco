import React, { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ShieldCheck, FileCheck, Type, Sparkles } from 'lucide-react';
import PolicyEditor from '../../components/admin/PolicyEditor';
import { DEFAULT_POLICIES, CORE_POLICY_METADATA, resolvePolicyLabel } from '../../context/ShopContext';

const AdminSettings = () => {
    const { settings, updateSettings } = useShop();
    
    if (!settings) return null; // Prevent crash during context hydration

    const [localSettings, setLocalSettings] = useState(settings);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [policyChanges, setPolicyChanges] = useState({});
    const [saveStatus, setSaveStatus] = useState(null);
    const [activePolicyId, setActivePolicyId] = useState(null);
    const [unlockedSlugs, setUnlockedSlugs] = useState([]);
    const [showNewPolicyForm, setShowNewPolicyForm] = useState(false);
    const [newPolicyData, setNewPolicyData] = useState({ title: '', navLabel: '', slug: '' });

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const saveSettings = async () => {
        setSaveStatus('saving');
        const now = new Date().toISOString();
        const settingsToSave = { ...localSettings };
        
        // Add timestamps and versioning for core changed policies
        Object.keys(policyChanges).forEach(key => {
            if (key.includes('Policy') && policyChanges[key] !== settings?.[key]) {
                settingsToSave[`${key}_updatedAt`] = now;
                settingsToSave[`${key}_lastVersion`] = settings?.[key] || DEFAULT_POLICIES?.[key.replace('Policy', '')];
            }
        });

        await updateSettings(settingsToSave);
        setPolicyChanges({});
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 3000);
    };

    const handlePolicyChange = (key, field, val) => {
        let processedValue = val;
        
        // Character limit and validation for labels
        if (field === 'navLabel') {
            processedValue = val.slice(0, 40);
        }

        setLocalSettings(prev => ({
            ...prev,
            policies: {
                ...prev.policies,
                [key]: {
                    ...(prev.policies[key] || {}),
                    [field]: processedValue
                }
            }
        }));
        
        setPolicyChanges(prev => ({ ...prev, [`policy_${key}_${field}`]: true }));
    };

    const rollbackPolicy = (key) => {
        const dbValue = settings?.policies?.[key];
        if (dbValue) {
            setLocalSettings(prev => ({
                ...prev,
                policies: {
                    ...prev.policies,
                    [key]: dbValue
                }
            }));
            // Remove changes from tracker for this specific policy
            const newChanges = { ...policyChanges };
            delete newChanges[`policy_${key}_title`];
            delete newChanges[`policy_${key}_navLabel`];
            delete newChanges[`policy_${key}_content`];
            setPolicyChanges(newChanges);
        }
    };

    const resetPolicyToDefault = (key) => {
        const meta = CORE_POLICY_METADATA?.find?.(m => m.id === key);
        if (meta) {
            handlePolicyChange(key, 'title', meta?.defaultTitle);
            handlePolicyChange(key, 'navLabel', meta?.defaultNavLabel);
            handlePolicyChange(key, 'content', DEFAULT_POLICIES?.[key] || '');
        }
    };

    const isPolicyDirty = (key) => {
        return !!(policyChanges[`policy_${key}_title`] || 
                  policyChanges[`policy_${key}_navLabel`] || 
                  policyChanges[`policy_${key}_content`]);
    };

    const togglePolicySection = (id) => {
        setActivePolicyId(prev => prev === id ? null : id);
    };

    const handleCustomPolicyChange = (id, field, value) => {
        setLocalSettings(prev => ({
            ...prev,
            customPolicies: (prev.customPolicies || []).map(p => 
                p.id === id ? { ...p, [field]: value, updatedAt: new Date().toISOString() } : p
            )
        }));
        setPolicyChanges(prev => ({ ...prev, [`custom_${id}`]: true }));
    };

    const deleteCustomPolicy = (id) => {
        if (window.confirm("Are you sure you want to delete this custom policy? This action cannot be undone.")) {
            setLocalSettings(prev => ({
                ...prev,
                customPolicies: (prev.customPolicies || []).filter(p => p.id !== id)
            }));
            setPolicyChanges(prev => ({ ...prev, [`custom_${id}_deleted`]: true }));
        }
    };

    const addCustomPolicy = () => {
        const newPolicy = {
            id: `p-${Date.now()}`,
            title: newPolicyData.title,
            navLabel: newPolicyData.navLabel || newPolicyData.title,
            slug: newPolicyData.slug || newPolicyData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            content: '',
            isVisible: true,
            order: (localSettings.customPolicies || []).length + 1,
            updatedAt: new Date().toISOString()
        };

        // Check for slug uniqueness
        const reservedSlugs = ['shipping', 'returns', 'refund', 'privacy', 'terms'];
        if (reservedSlugs.includes(newPolicy.slug) || (localSettings.customPolicies || []).some(p => p.slug === newPolicy.slug)) {
            alert("Slug already exists or is reserved. Please choose a unique title/slug.");
            return;
        }

        setLocalSettings(prev => ({
            ...prev,
            customPolicies: [...(prev.customPolicies || []), newPolicy]
        }));
        setPolicyChanges(prev => ({ ...prev, [`custom_${newPolicy.id}_added`]: true }));
        setNewPolicyData({ title: '', navLabel: '', slug: '' });
        setShowNewPolicyForm(false);
        setActivePolicyId(newPolicy.id);
    };

    const toggleSlugLock = (id) => {
        setUnlockedSlugs(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
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
                    {CORE_POLICY_METADATA.map((meta) => {
                        const policyData = localSettings.policies?.[meta.id] || {};
                        const isExpanded = activePolicyId === meta.id;
                        const navLabel = policyData.navLabel || '';
                        const charCount = navLabel.length;

                        return (
                            <div key={meta.id} className="space-y-1">
                                <div className="flex items-center justify-between px-2 py-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[9px] font-bold text-brand-charcoal/20 uppercase tracking-widest">Core System Policy</span>
                                        {meta.id === 'sizing_guide' && (
                                            <div className="flex items-center space-x-1 px-2 py-0.5 bg-brand-rose/10 rounded-full border border-brand-rose/20">
                                                <Sparkles size={8} className="text-brand-rose" />
                                                <span className="text-[8px] font-bold text-brand-rose uppercase tracking-tighter">Dual-Unit AI Engine Active</span>
                                            </div>
                                        )}
                                    </div>
                                    {isPolicyDirty(meta.id) && (
                                        <span className="text-[8px] font-bold text-brand-rose uppercase tracking-widest animate-pulse">Pending Sync</span>
                                    )}
                                </div>
                                <PolicyEditor 
                                    label={resolvePolicyLabel(meta.id, localSettings)}
                                    value={policyData.content || ''}
                                    onChange={(val) => handlePolicyChange(meta.id, 'content', val)}
                                    onRollback={() => rollbackPolicy(meta.id)}
                                    onReset={() => resetPolicyToDefault(meta.id)}
                                    hasUnsavedChanges={isPolicyDirty(meta.id)}
                                    isExpanded={isExpanded}
                                    onToggle={() => togglePolicySection(meta.id)}
                                />

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-brand-cream/10 p-8 pt-4 rounded-b-sm border-x border-b border-brand-charcoal/5 space-y-8"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                <div className="space-y-3">
                                                    <label className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest flex items-center gap-2">
                                                        <Type size={10} className="text-brand-rose" />
                                                        Page Header Title
                                                    </label>
                                                    <input 
                                                        value={policyData.title || ''}
                                                        onChange={(e) => handlePolicyChange(meta.id, 'title', e.target.value)}
                                                        className="w-full bg-white p-4 text-sm font-medium border border-transparent focus:border-brand-rose/20 outline-none transition-all rounded-sm shadow-sm"
                                                        placeholder={meta.defaultTitle}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Footer Navigation Label</label>
                                                        <span className={`text-[9px] font-mono font-bold tracking-tight px-2 py-0.5 rounded-full transition-all ${charCount > 35 ? 'bg-brand-rose text-white' : 'bg-brand-charcoal/5 text-brand-charcoal/40'}`}>
                                                            {charCount} / 40
                                                        </span>
                                                    </div>
                                                    <div className="relative group">
                                                        <input 
                                                            value={navLabel}
                                                            onChange={(e) => handlePolicyChange(meta.id, 'navLabel', e.target.value)}
                                                            onBlur={(e) => handlePolicyChange(meta.id, 'navLabel', e.target.value.trim())}
                                                            maxLength={40}
                                                            className={`w-full bg-white p-4 text-sm font-medium border outline-none transition-all rounded-sm shadow-sm ${charCount >= 35 ? 'border-brand-rose/30 focus:border-brand-rose' : 'border-transparent focus:border-brand-charcoal/20'}`}
                                                            placeholder={meta.defaultNavLabel}
                                                        />
                                                        {charCount >= 38 && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-rose animate-pulse" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    {/* Safeguard: Core policies are always visible and cannot be deleted */}

                    {/* Custom Policies Divider */}
                    <div className="pt-10 pb-4 border-t border-brand-charcoal/5 flex justify-between items-center">
                        <div>
                            <h4 className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-[0.2em]">Custom Policies & Content</h4>
                            <p className="text-[9px] text-brand-charcoal/30 mt-1 italic uppercase">Ordered below core legal sections</p>
                        </div>
                        <button 
                            onClick={() => setShowNewPolicyForm(true)}
                            className="bg-brand-charcoal text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center space-x-2"
                        >
                            <Plus size={14} />
                            <span>Add New Policy</span>
                        </button>
                    </div>

                    {/* New Policy Form */}
                    <AnimatePresence>
                        {showNewPolicyForm && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-brand-cream/20 p-8 rounded-sm border border-brand-charcoal/10 space-y-6 overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Policy Title</label>
                                        <input 
                                            value={newPolicyData.title}
                                            onChange={e => {
                                                const title = e.target.value;
                                                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                setNewPolicyData({ ...newPolicyData, title, slug });
                                            }}
                                            placeholder="e.g. Policy Help"
                                            className="w-full bg-white p-4 font-medium text-sm border-none outline-none focus:ring-1 focus:ring-brand-rose"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Navigation Label (Optional)</label>
                                        <input 
                                            value={newPolicyData.navLabel}
                                            onChange={e => setNewPolicyData({ ...newPolicyData, navLabel: e.target.value })}
                                            placeholder="e.g. Policy Guide"
                                            className="w-full bg-white p-4 font-medium text-sm border-none outline-none focus:ring-1 focus:ring-brand-rose"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <p className="text-[10px] text-brand-charcoal/40 italic">
                                        URL Slug: <span className="text-brand-rose font-medium">/policies/{newPolicyData.slug || '...'}</span>
                                    </p>
                                    <div className="flex space-x-3">
                                        <button onClick={() => setShowNewPolicyForm(false)} className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-charcoal transition-all">Cancel</button>
                                        <button 
                                            onClick={addCustomPolicy}
                                            disabled={!newPolicyData.title.trim()}
                                            className="px-8 py-3 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-black disabled:opacity-30 transition-all"
                                        >
                                            Create Policy Section
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Custom Policies List */}
                    <div className="space-y-6">
                        {(localSettings.customPolicies || [])
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((policy) => (
                                <div key={policy.id} className="relative group/policy">
                                    <div className="absolute right-[-5px] top-6 z-10 flex flex-col space-y-2 group-hover/policy:right-[5px] transition-all opacity-0 group-hover/policy:opacity-100">
                                        <button 
                                            onClick={() => deleteCustomPolicy(policy.id)}
                                            className="p-3 bg-white text-brand-charcoal/40 hover:text-red-500 shadow-xl rounded-sm border border-brand-charcoal/5 transition-all"
                                            title="Delete Policy"
                                        >
                                            <Trash2 size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    
                                    <PolicyEditor 
                                        label={policy.title}
                                        value={policy.content || ''}
                                        onChange={(val) => handleCustomPolicyChange(policy.id, 'content', val)}
                                        onRollback={() => {}}
                                        onReset={() => handleCustomPolicyChange(policy.id, 'content', '')}
                                        hasUnsavedChanges={policyChanges[`custom_${policy.id}`]}
                                        isExpanded={activePolicyId === policy.id}
                                        onToggle={() => togglePolicySection(policy.id)}
                                    />

                                    {/* Additional Custom Controls inside Expanded Panel (if PolicyEditor supported custom slots, but we'll overlay for now as we control it) */}
                                    <AnimatePresence>
                                        {activePolicyId === policy.id && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-brand-cream/10 p-8 pt-4 rounded-b-sm border-x border-b border-brand-charcoal/5 space-y-8"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest flex justify-between">
                                                            Slug Stability 
                                                            <button onClick={() => toggleSlugLock(policy.id)} className="text-brand-rose hover:underline">
                                                                {unlockedSlugs.includes(policy.id) ? 'Lock' : 'Unlock Link'}
                                                            </button>
                                                        </label>
                                                        <input 
                                                            value={policy.slug}
                                                            disabled={!unlockedSlugs.includes(policy.id)}
                                                            onChange={e => handleCustomPolicyChange(policy.id, 'slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                                                            className={`w-full bg-white p-3 text-sm font-medium border-none outline-none focus:ring-1 focus:ring-brand-rose transition-opacity ${unlockedSlugs.includes(policy.id) ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Navigation Label</label>
                                                        <input 
                                                            value={policy.navLabel || ''}
                                                            onChange={e => handleCustomPolicyChange(policy.id, 'navLabel', e.target.value)}
                                                            placeholder={policy.title}
                                                            className="w-full bg-white p-3 text-sm font-medium border-none outline-none focus:ring-1 focus:ring-brand-rose"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Order</label>
                                                            <input 
                                                                type="number"
                                                                value={policy.order || 0}
                                                                onChange={e => handleCustomPolicyChange(policy.id, 'order', parseInt(e.target.value))}
                                                                className="w-full bg-white p-3 text-sm font-medium border-none outline-none focus:ring-1 focus:ring-brand-rose"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Visibility</label>
                                                            <button 
                                                                onClick={() => handleCustomPolicyChange(policy.id, 'isVisible', !policy.isVisible)}
                                                                className={`w-full p-3 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all ${policy.isVisible ? 'bg-brand-charcoal text-white hover:bg-black' : 'bg-brand-rose text-brand-charcoal hover:bg-white border border-brand-rose/20'}`}
                                                            >
                                                                {policy.isVisible ? 'Visible' : 'Hidden'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                    </div>
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
