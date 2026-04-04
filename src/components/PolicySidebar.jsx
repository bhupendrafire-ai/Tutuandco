import React from 'react';
import { Link } from 'react-router-dom';
import { useShop, POLICY_DEFAULTS, resolvePolicyLabel } from '../context/ShopContext';

/**
 * Shared Policy Sidebar Component
 * Features:
 * - Fixed 320px width for layout stability
 * - Editorial typography (Normal case, reduced letter-spacing)
 * - Single source of truth for labels via resolvePolicyLabel
 */
const PolicySidebar = ({ activeKey }) => {
    const { settings } = useShop();

    // Core Policies List
    const coreKeys = Object.keys(POLICY_DEFAULTS);
    
    // Visible Custom Policies
    const customPolicies = (settings.customPolicies || [])
        .filter(p => p.isVisible && p.content && p.content.trim() !== "")
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <nav className="w-full lg:w-[320px] flex-shrink-0 space-y-8">
            <h1 className="text-3xl font-medium text-brand-charcoal mb-10 tracking-tight">Customer care</h1>
            <div className="flex flex-col space-y-1">
                {/* 1. Core Policies */}
                {coreKeys.map((key) => (
                    <Link 
                        key={key}
                        to={`/policies/${key}`} 
                        className={`flex items-center px-6 py-4 rounded-sm transition-all duration-300 ${activeKey === key ? 'bg-brand-rose text-brand-charcoal shadow-sm border-l-2 border-brand-charcoal/20' : 'hover:bg-brand-cream text-brand-charcoal/70 hover:text-brand-charcoal'}`}
                    >
                        <span className="text-[13px] font-medium tracking-tight">
                            {resolvePolicyLabel(key, settings)}
                        </span>
                    </Link>
                ))}
                
                {/* Divider if custom policies exist */}
                {customPolicies.length > 0 && (
                    <div className="h-px bg-brand-charcoal/5 my-4 mx-6" />
                )}

                {/* 2. Custom Policies */}
                {customPolicies.map((policy) => (
                    <Link 
                        key={policy.slug}
                        to={`/policies/${policy.slug}`} 
                        className={`flex items-center px-6 py-4 rounded-sm transition-all duration-300 ${activeKey === policy.slug ? 'bg-brand-rose text-brand-charcoal shadow-sm border-l-2 border-brand-charcoal/20' : 'hover:bg-brand-cream text-brand-charcoal/70 hover:text-brand-charcoal'}`}
                    >
                        <span className="text-[13px] font-medium tracking-tight">
                            {policy.navLabel || policy.title}
                        </span>
                    </Link>
                ))}
            </div>
            
            <div className="pt-8 px-6 border-t border-brand-charcoal/5 hidden lg:block">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/30 mb-2">Need help?</p>
                <p className="text-xs text-brand-charcoal/60 leading-relaxed italic">
                    Our team is here to assist you with any questions about our products or policies.
                </p>
            </div>
        </nav>
    );
};

export default PolicySidebar;
