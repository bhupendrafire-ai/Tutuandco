import React from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useShop, POLICY_DEFAULTS, processDualUnits } from '../context/ShopContext';
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
    // Find by ID or Slug for maximum compatibility
    const metaCandidate = Object.values(POLICY_DEFAULTS).find(p => p.id === policyKey || p.slug === policyKey);
    const resolvedKey = metaCandidate?.id || policyKey;
    
    const coreDefault = POLICY_DEFAULTS?.[resolvedKey];
    const coreAdmin = settings?.policies?.[resolvedKey];

    if (coreDefault) {
        displayTitle = coreAdmin?.title || coreDefault.title;
        displayContent = coreAdmin?.content || coreDefault.content;
        updatedAt = coreAdmin?.updatedAt || settings?.[`${resolvedKey}Policy_updatedAt`];
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
                        className="policy-content" 
                        dangerouslySetInnerHTML={{ 
                            __html: resolvedKey === 'sizing_guide' ? processDualUnits(displayContent) : displayContent 
                        }} 
                    />
                )}

                {/* Natural Content Closing */}
                <div className="text-brand-charcoal/80">
                    <p className="mt-8">
                        For any questions, contact us at{" "}
                        <a href="mailto:hello.tutuandco@gmail.com" className="underline underline-offset-2 hover:text-brand-rose transition-colors duration-300">
                            hello.tutuandco@gmail.com
                        </a>.
                    </p>

                    <p className="mt-4">
                        Tutu & Co · Operated by Filter Works (Proprietorship) · GSTIN: 27ABYPW0381K1ZQ
                    </p>

                    <p className="mt-4 leading-relaxed">
                        Filter Works (Proprietorship)<br />
                        S No 879, Siddhivinayak Industrial Estate, Shed No-01<br />
                        Kudalwadi, Chikhali<br />
                        Pune, Maharashtra 411062<br />
                        India
                    </p>
                </div>
            </div>
            <style sx>{`
                .policy-content {
                    all: initial;
                    display: block;
                    font-family: 'Avenir Next Rounded Pro', system-ui, sans-serif;
                    line-height: 1.6;
                    color: #2f2f2f;
                    text-align: left;
                }
                .policy-content h2 { 
                    display: block;
                    font-size: 1.5rem;
                    font-weight: 500;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    color: #1a1a1a;
                }
                .policy-content h3 { 
                    display: block;
                    font-size: 1.25rem;
                    font-weight: 500;
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    color: #1a1a1a;
                }
                .policy-content p { 
                    display: block;
                    margin-bottom: 1rem;
                }
                .policy-content ul {
                    display: block;
                    list-style-type: disc;
                    margin-bottom: 1rem;
                    padding-left: 2rem;
                }
                .policy-content li {
                    display: list-item;
                    margin-bottom: 0.5rem;
                }
                .policy-content strong { font-weight: 700; color: #000; }
                .policy-content em { font-style: italic; }

                .policy-content table {
                    all: revert;
                    display: table;
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 16px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    table-layout: auto;
                }
                .policy-content thead {
                    display: table-header-group;
                    background: rgba(0, 0, 0, 0.03);
                }
                .policy-content tbody {
                    display: table-row-group;
                }
                .policy-content tr {
                    display: table-row;
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                }
                .policy-content th {
                    display: table-cell;
                    text-align: left;
                    font-weight: 600;
                    padding: 12px 16px;
                    letter-spacing: 0.04em;
                    font-size: 12px;
                    text-transform: uppercase;
                    background: rgba(0, 0, 0, 0.03);
                }
                .policy-content td {
                    display: table-cell;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                }
                @media (max-width: 768px) {
                    .policy-content table {
                        display: block;
                        overflow-x: auto;
                        white-space: nowrap;
                        -webkit-overflow-scrolling: touch;
                    }
                }
            `}</style>
        </PolicyLayout>
    );
};

export default Policy;
