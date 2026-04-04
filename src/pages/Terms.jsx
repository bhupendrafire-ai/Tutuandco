import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useShop, DEFAULT_POLICIES } from '../context/ShopContext';
import { Clock } from 'lucide-react';

const Terms = () => {
    const location = useLocation();
    const { settings } = useShop();

    // Canonical Redirect (SEO & Compliance)
    if (location.pathname === '/terms') {
        return <Navigate to="/policies/terms" replace />;
    }

    const dynamicContent = settings.termsPolicy;
    const updatedAt = settings.termsPolicy_updatedAt;

    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-[800px] mx-auto px-6">
                <main className="bg-brand-cream p-12 lg:p-20 rounded-sm shadow-sm">
                    <h1 className="text-4xl font-medium text-brand-charcoal mb-12">Terms & Conditions</h1>
                    
                    <div className="prose prose-lg text-brand-charcoal/80 leading-relaxed space-y-10">
                        {dynamicContent ? (
                            <div className="space-y-6" dangerouslySetInnerHTML={{ __html: dynamicContent }} />
                        ) : (
                            <div className="space-y-6" dangerouslySetInnerHTML={{ __html: DEFAULT_POLICIES.terms }} />
                        )}

                        {updatedAt && (
                            <div className="pt-12 border-t border-brand-charcoal/5 flex items-center space-x-3 text-brand-charcoal/30">
                                <Clock size={12} />
                                <p className="text-[10px] font-bold uppercase tracking-widest">
                                    Last updated: {new Date(updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        )}

                        <div className="mt-16 text-sm text-brand-charcoal/80 leading-relaxed border-t border-brand-charcoal/10 pt-10">
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
                </main>
            </div>
        </div>
    );
};

export default Terms;
