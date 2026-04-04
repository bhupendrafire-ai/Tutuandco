
import React from 'react';
import { useParams, Link, useLocation, Navigate } from 'react-router-dom';
import { Shield, RefreshCw, Truck, HeartHandshake, Ruler, Clock } from 'lucide-react';
import { useShop, DEFAULT_POLICIES, CORE_POLICY_METADATA } from '../context/ShopContext';
/* Icons removed from display per user request */

const Policy = () => {
    const { section } = useParams();
    const location = useLocation();
    const { settings, loading } = useShop();

    // Canonical Redirect (SEO & Compliance)
    if (location.pathname.startsWith('/policy/')) {
        return <Navigate to={location.pathname.replace('/policy/', '/policies/')} replace />;
    }

    // Prevent rendering until data is fully Hydrated
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

    // Strict Core Definitions (Fixed Order 1-4)
    const coreDefinitions = CORE_POLICY_METADATA.map(core => ({
        ...core,
        title: settings[`${core.settingsKey}_title`] || core.defaultTitle,
        navLabel: settings[`${core.settingsKey}_navLabel`] || settings[`${core.settingsKey}_title`] || core.defaultNavLabel
    }));

    // Combine with visible custom policies
    const visibleCustom = (settings.customPolicies || [])
        .filter(p => p.isVisible && p.content && p.content.trim() !== "")
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Resolve active policy content
    let active = null;
    let isCustom = false;
    let displayTitle = '';
    let displayContent = '';
    let updatedAt = null;

    const coreMatch = coreDefinitions.find(d => d.slug === section);
    if (coreMatch) {
        displayTitle = coreMatch.title;
        // Strict Fallback: only if null or undefined
        const adminContent = settings[coreMatch.settingsKey];
        displayContent = (adminContent !== null && adminContent !== undefined) 
            ? adminContent 
            : DEFAULT_POLICIES[coreMatch.slug === 'returns' ? 'refund' : coreMatch.slug];
            
        updatedAt = settings[`${coreMatch.settingsKey}_updatedAt`];
    } else {
        const customMatch = visibleCustom.find(p => p.slug === section);
        if (customMatch) {
            displayTitle = customMatch.title;
            displayContent = customMatch.content;
            updatedAt = customMatch.updatedAt;
            isCustom = true;
        } else {
            // Default Fallback to Shipping
            const fallback = coreDefinitions[0];
            displayTitle = fallback.title;
            const adminContent = settings[fallback.settingsKey];
            displayContent = (adminContent !== null && adminContent !== undefined) ? adminContent : DEFAULT_POLICIES.shipping;
        }
    }

    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-[1440px] mx-auto px-3 grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Sidebar Nav */}
                <nav className="lg:col-span-4 space-y-8">
                    <h1 className="text-4xl font-medium text-brand-charcoal mb-12">Customer care</h1>
                    <div className="flex flex-col space-y-2">
                        {/* 1. Core Policies (Fixed 1-4 Order) */}
                        {coreDefinitions.map((core) => (
                            <Link 
                                key={core.slug}
                                to={`/policies/${core.slug}`} 
                                className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === core.slug ? 'bg-brand-rose text-brand-charcoal shadow-md border-l-4 border-brand-charcoal/20' : 'hover:bg-brand-cream/50 text-brand-charcoal'}`}
                            >
                                <span className="text-[11px] font-medium tracking-wide uppercase">{core.navLabel}</span>
                            </Link>
                        ))}
                        
                        {/* 2. Custom Policies (Dynamic Order after Core) */}
                        {visibleCustom.map((policy) => (
                            <Link 
                                key={policy.slug}
                                to={`/policies/${policy.slug}`} 
                                className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === policy.slug ? 'bg-brand-rose text-brand-charcoal shadow-md border-l-4 border-brand-charcoal/20' : 'hover:bg-brand-cream/50 text-brand-charcoal'}`}
                            >
                                <span className="text-[11px] font-medium tracking-wide uppercase">{policy.navLabel || policy.title}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Content Area */}
                <main className="lg:col-span-8 bg-brand-cream p-12 lg:p-20 rounded-sm shadow-sm">
                     <h2 className="text-4xl font-medium text-brand-charcoal mb-10">{displayTitle}</h2>
                     <div className="prose prose-lg text-brand-charcoal/80 leading-relaxed space-y-8">
                         <div className="policy-content" dangerouslySetInnerHTML={{ __html: displayContent }} />

                         {updatedAt && (
                             <div className="pt-12 border-t border-brand-charcoal/5 flex items-center space-x-3 text-brand-charcoal/30">
                                 <Clock size={12} />
                                 <p className="text-[10px] font-bold uppercase tracking-widest">
                                     Last updated: {new Date(updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                 </p>
                             </div>
                         )}
                         
                         <p className="pt-8 border-t border-brand-charcoal/5 italic">
                             Our team is dedicated to providing the best experience for both you and your furry companion. 
                             If you have any specific questions that aren't addressed here, please don't hesitate to reach out 
                             to our support team.
                         </p>
                          <div className="pt-10 border-t border-brand-charcoal/10">
                             <p className="text-sm font-medium text-brand-charcoal mb-4">Contact support</p>
                             <p className="text-sm">hello.tutuandco@gmail.com</p>
                             <p className="text-sm">Monday – Friday, 9:00 AM – 6:00 PM IST</p>
                             <div className="mt-12 text-sm text-brand-charcoal/80 leading-relaxed font-normal">
                                 <p className="mb-4">Tutu & Co · Operated by Filter Works (Proprietorship) · GSTIN: 27ABYPW0381K1ZQ</p>

                                 <div className="mt-4">
                                     <p>Filter Works (Proprietorship)</p>
                                     <p>S No 879, Siddhivinayak Industrial Estate, Shed No-01</p>
                                     <p>Kudalwadi, Chikhali</p>
                                     <p>Pune, Maharashtra 411062</p>
                                     <p>India</p>
                                 </div>
                             </div>
                         </div>
                     </div>
                </main>
            </div>
        </div>
    );
};

export default Policy;
