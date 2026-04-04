
import React from 'react';
import { useParams, Link, useLocation, Navigate } from 'react-router-dom';
import { Shield, RefreshCw, Truck, HeartHandshake, Ruler, Clock } from 'lucide-react';
import { useShop, DEFAULT_POLICIES } from '../context/ShopContext';
/* Icons removed from display per user request */

const Policy = () => {
    const { section } = useParams();
    const location = useLocation();
    const { settings } = useShop();

    // Canonical Redirect (SEO & Compliance)
    if (location.pathname.startsWith('/policy/')) {
        return <Navigate to={location.pathname.replace('/policy/', '/policies/')} replace />;
    }

    // Core fixed policy sections
    const coreSections = {
        'shipping': {
            title: 'Shipping Policy',
            navLabel: 'Shipping Info',
            content: (
                <div key="shipping" className="space-y-8" dangerouslySetInnerHTML={{ __html: settings.shippingPolicy || DEFAULT_POLICIES.shipping }} />
            ),
            updatedAt: settings.shippingPolicy_updatedAt
        },
        'returns': {
            title: 'Refund & Cancellation Policy',
            navLabel: 'Returns & Exchanges',
            content: (
                <div key="returns" className="space-y-12" dangerouslySetInnerHTML={{ __html: settings.refundPolicy || DEFAULT_POLICIES.refund }} />
            ),
            updatedAt: settings.refundPolicy_updatedAt
        },
        'privacy': {
            title: 'Privacy Policy',
            navLabel: 'Privacy Policy',
            content: (
                <div key="privacy" className="space-y-6" dangerouslySetInnerHTML={{ __html: settings.privacyPolicy || DEFAULT_POLICIES.privacy }} />
            ),
            updatedAt: settings.privacyPolicy_updatedAt
        }
    };

    // Combine with visible custom policies
    const visibleCustom = (settings.customPolicies || [])
        .filter(p => p.isVisible && p.content && p.content.trim() !== "")
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Resolve active policy
    let active = null;
    let isCustom = false;

    if (coreSections[section]) {
        active = coreSections[section];
    } else {
        const found = visibleCustom.find(p => p.slug === section);
        if (found) {
            active = found;
            isCustom = true;
        } else {
            active = coreSections['shipping']; // Default fallback
        }
    }

    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-[1440px] mx-auto px-3 grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Sidebar Nav */}
                <nav className="lg:col-span-4 space-y-8">
                    <h1 className="text-4xl font-medium text-brand-charcoal mb-12">Customer care</h1>
                    <div className="flex flex-col space-y-2">
                        {/* Core Links */}
                        {Object.keys(coreSections).map((key) => (
                            <Link 
                                key={key}
                                to={`/policies/${key}`} 
                                className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === key ? 'bg-brand-rose text-brand-charcoal shadow-md' : 'hover:bg-brand-cream/50 text-brand-charcoal'}`}
                            >
                                <span className="text-[11px] font-medium tracking-wide uppercase">{coreSections[key].navLabel || coreSections[key].title}</span>
                            </Link>
                        ))}
                        
                        {/* Custom Links */}
                        {visibleCustom.map((policy) => (
                            <Link 
                                key={policy.slug}
                                to={`/policies/${policy.slug}`} 
                                className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === policy.slug ? 'bg-brand-rose text-brand-charcoal shadow-md' : 'hover:bg-brand-cream/50 text-brand-charcoal'}`}
                            >
                                <span className="text-[11px] font-medium tracking-wide uppercase">{policy.navLabel || policy.title}</span>
                            </Link>
                        ))}

                        {/* Special Case: Terms sidebar link (always at bottom) */}
                        <Link 
                            to="/policies/terms" 
                            className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === 'terms' ? 'bg-brand-rose text-brand-charcoal shadow-md' : 'hover:bg-brand-cream/50 text-brand-charcoal'}`}
                        >
                            <span className="text-[11px] font-medium tracking-wide uppercase">Terms & Conditions</span>
                        </Link>
                    </div>
                </nav>

                {/* Content Area */}
                <main className="lg:col-span-8 bg-brand-cream p-12 lg:p-20 rounded-sm shadow-sm">
                     <h2 className="text-4xl font-medium text-brand-charcoal mb-10">{active.title}</h2>
                     <div className="prose prose-lg text-brand-charcoal/80 leading-relaxed space-y-8">
                         {isCustom ? (
                             <div className="space-y-6" dangerouslySetInnerHTML={{ __html: active.content }} />
                         ) : (
                             active.content
                         )}

                         {active.updatedAt && (
                             <div className="pt-12 border-t border-brand-charcoal/5 flex items-center space-x-3 text-brand-charcoal/30">
                                 <Clock size={12} />
                                 <p className="text-[10px] font-bold uppercase tracking-widest">
                                     Last updated: {new Date(active.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
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
