
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

    const sections = {
        'shipping': {
            title: 'Shipping Policy',
            icon: Truck,
            content: (
                <div className="space-y-8" dangerouslySetInnerHTML={{ __html: DEFAULT_POLICIES.shipping }} />
            )
        },
        'returns': {
            title: 'Refund & Cancellation Policy',
            icon: RefreshCw,
            content: (
                <div className="space-y-12" dangerouslySetInnerHTML={{ __html: DEFAULT_POLICIES.refund }} />
            )
        },
        'privacy': {
            title: 'Privacy Policy',
            icon: HeartHandshake,
            content: (
                <div className="space-y-6" dangerouslySetInnerHTML={{ __html: DEFAULT_POLICIES.privacy }} />
            )
        },
        'care': {
            title: 'Product Care',
            icon: Shield,
            content: (
                <div className="space-y-8">
                    <p className="text-xl italic font-medium text-brand-charcoal leading-relaxed">"Each Tutu & Co piece is thoughtfully made to be worn, loved, and lived in. With a little care, it’ll stay just as special."</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal mb-4">Washing</h3>
                            <p>Machine wash on a gentle cycle with similar colours using mild detergent. Avoid bleach.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal mb-4">Drying</h3>
                            <p>Air dry for best results, or tumble dry on low.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal mb-4">Ironing</h3>
                            <p>If needed, use a low heat setting.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal mb-4">Storage</h3>
                            <p>Store in a clean, dry place when not in use.</p>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-brand-charcoal/10 mt-12">
                        <h3 className="text-sm font-medium text-brand-charcoal mb-4">A small note</h3>
                        <p className="italic">Each piece is handmade, so slight variations are natural. With regular use, some wear is expected — it’s all part of your pet’s adventures.</p>
                    </div>
                </div>
            )
        }
    };

    const active = sections[section] || sections['shipping'];

    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-[1440px] mx-auto px-3 grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Sidebar Nav */}
                <nav className="lg:col-span-4 space-y-8">
                    <h1 className="text-4xl font-medium text-brand-charcoal mb-12">Customer care</h1>
                    <div className="flex flex-col space-y-2">
                        {Object.keys(sections).map((key) => (
                            <Link 
                                key={key}
                                to={`/policies/${key}`} 
                                className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === key ? 'bg-brand-rose text-brand-charcoal shadow-md' : 'hover:bg-brand-cream/50 text-brand-charcoal'}`}
                            >
                                <span className="text-[11px] font-medium tracking-wide uppercase">{sections[key].title}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Content Area */}
                <main className="lg:col-span-8 bg-brand-cream p-12 lg:p-20 rounded-sm shadow-sm">
                     <h2 className="text-4xl font-medium text-brand-charcoal mb-10">{active.title}</h2>
                     <div className="prose prose-lg text-brand-charcoal/80 leading-relaxed space-y-8">
                         {(() => {
                             const settingsKeyMap = {
                                 'shipping': 'shippingPolicy',
                                 'returns': 'refundPolicy',
                                 'privacy': 'privacyPolicy'
                             };
                             const dynamicKey = settingsKeyMap[section];
                             const dynamicContent = dynamicKey ? settings[dynamicKey] : null;
                             const updatedAt = dynamicKey ? settings[`${dynamicKey}_updatedAt`] : null;

                             return (
                                 <>
                                     {dynamicContent ? (
                                         <div className="space-y-6" dangerouslySetInnerHTML={{ __html: dynamicContent }} />
                                     ) : (
                                         active.content
                                     )}

                                     {updatedAt && (
                                         <div className="pt-12 border-t border-brand-charcoal/5 flex items-center space-x-3 text-brand-charcoal/30">
                                             <Clock size={12} />
                                             <p className="text-[10px] font-bold uppercase tracking-widest">
                                                 Last updated: {new Date(updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                             </p>
                                         </div>
                                     )}
                                 </>
                             );
                         })()}
                         
                         <p className="pt-8 border-t border-brand-charcoal/5 italic">
                             Our team is dedicated to providing the best experience for both you and your furry companion. 
                             If you have any specific questions that aren't addressed here, please don't hesitate to reach out 
                             to our support team.
                         </p>
                          <div className="pt-10 border-t border-brand-charcoal/10">
                             <p className="text-sm font-medium text-brand-charcoal mb-4">Contact support</p>
                             <p className="text-sm">support@tutuandco.com</p>
                             <p className="text-sm">Mon - Fri: 9am - 6pm EST</p>
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
