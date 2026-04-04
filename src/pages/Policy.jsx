import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useShop, POLICY_DEFAULTS } from '../context/ShopContext';
import PolicyLayout from '../components/PolicyLayout';

/**
 * Unified Policy Component
 * Features:
 * - Content resolution from Core (Admin), Custom (Admin), or System Defaults
 * - Persistent Shared Layout (PolicyLayout)
 * - Conditional GST/Address rendering
 * - Multi-stage resolution for maximum reliability
 */
const Policy = () => {
    const { section: policyKey } = useParams();
    const location = useLocation();
    const { settings, loading } = useShop();

    // Canonical Redirect (SEO & Compliance)
    if (location.pathname.startsWith('/policy/')) {
        return <Navigate to={location.pathname.replace('/policy/', '/policies/')} replace />;
    }

    if (loading) {
        return (
            <div className="bg-brand-sage min-h-screen pt-32 pb-32 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-4 border-brand-rose/20 border-t-brand-rose animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">Synchronizing Policies...</p>
                </div>
            </div>
        );
    }

    // --- Hardened Content Resolution ---
    let displayTitle = '';
    let displayContent = '';
    let updatedAt = null;

    // 1. Check Core Policies (including Migrated Admin Data)
    const coreDefault = POLICY_DEFAULTS?.[policyKey];
    const coreAdmin = settings?.policies?.[policyKey];

    if (coreDefault) {
        displayTitle = coreAdmin?.title || coreDefault.title;
        displayContent = coreAdmin?.content || coreDefault.content;
        updatedAt = coreAdmin?.updatedAt || settings?.[`${policyKey}Policy_updatedAt`];
    } 
    // 2. Check Custom Policies
    else {
        const customMatch = (settings?.customPolicies || []).find(p => p.slug === policyKey);
        if (customMatch) {
            displayTitle = customMatch?.title;
            displayContent = customMatch?.content;
            updatedAt = customMatch?.updatedAt;
        } 
        // 3. Absolute Fallback (Shipping)
        else {
            const fallback = POLICY_DEFAULTS.shipping;
            displayTitle = fallback.title;
            displayContent = fallback.content;
        }
    }

    // --- Conditional Meta Injection ---
    // Ensure consistent business address and GST across all policies
    const showBusinessInfo = settings?.gstin || settings?.address;

    return (
        <PolicyLayout activeKey={policyKey}>
            <div className="prose prose-lg text-brand-charcoal/80 leading-relaxed space-y-12 max-w-none">
                <div className="space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-medium text-brand-charcoal tracking-tight">
                        {displayTitle}
                    </h2>
                    {updatedAt && (
                        <div className="flex items-center space-x-2 text-brand-charcoal/30">
                            <Clock size={12} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">
                                Last updated: {new Date(updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Content with Fallback Detection */}
                {!displayContent || displayContent.trim() === "" ? (
                    <div className="py-20 text-center border-y border-brand-charcoal/5">
                        <p className="text-brand-charcoal/40 italic">Policy content is being updated. Please check back shortly.</p>
                    </div>
                ) : (
                    <div 
                        className="policy-content prose-headings:font-medium prose-p:mb-6 prose-li:mb-2 prose-strong:text-brand-charcoal" 
                        dangerouslySetInnerHTML={{ __html: displayContent }} 
                    />
                )}

                {/* Persistent Editorial Footer */}
                <div className="pt-16 border-t border-brand-charcoal/5 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-brand-charcoal/40">Contact protection</p>
                            <p className="text-sm font-medium">hello.tutuandco@gmail.com</p>
                            <p className="text-xs text-brand-charcoal/60">Monday – Friday, 9:00 AM – 6:00 PM IST</p>
                        </div>
                        
                        <div className="text-xs text-brand-charcoal/60 leading-relaxed italic">
                            Our team is dedicated to providing the best experience for both you and your furry companion. 
                            If you have specific questions not addressed above, reach out to us.
                        </div>
                    </div>

                    {/* Legal Entity block - Only if data exists */}
                    {showBusinessInfo && (
                        <div className="pt-12 border-t border-brand-charcoal/5 text-[11px] text-brand-charcoal/60 uppercase tracking-widest leading-relaxed">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div>
                                    <p className="mb-2 font-bold">{settings?.shopName || 'Tutu & Co'}</p>
                                    <p className="opacity-70">Operated by {settings?.proprietorshipName || 'Filter Works (Proprietorship)'}</p>
                                    {settings?.gstin && <p className="opacity-70">GSTIN: {settings.gstin}</p>}
                                </div>
                                {settings?.address && (
                                    <div className="opacity-70">
                                        <p>{settings.address?.line1}</p>
                                        <p>{settings.address?.line2}</p>
                                        <p>{settings.address?.city}, {settings.address?.state} {settings.address?.pincode}</p>
                                        <p>{settings.address?.country || 'India'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PolicyLayout>
    );
};

export default Policy;
