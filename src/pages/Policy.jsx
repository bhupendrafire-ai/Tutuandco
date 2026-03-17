
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, RefreshCw, Truck, HeartHandshake } from 'lucide-react';

const Policy = () => {
    const { section } = useParams();

    const sections = {
        'shipping': {
            title: 'Shipping Policy',
            icon: Truck,
            content: 'We offer free standard shipping on orders over $999. For all other orders, a flat rate of $89 applies. Most orders are processed within 48 hours and delivered within 3-5 business days.'
        },
        'returns': {
            title: 'Returns & Exchanges',
            icon: RefreshCw,
            content: 'Not the perfect fit? No problem. We accept returns and exchanges on all unused items within 30 days of purchase. Please ensure tags are still attached and items are free of pet hair.'
        },
        'care': {
            title: 'Product Care',
            icon: Shield,
            content: 'To maintain the longevity of our organic fabrics, we recommend machine washing in cold water on a gentle cycle. Hang or lay flat to dry. Do not bleach.'
        },
        'privacy': {
            title: 'Privacy Commitment',
            icon: HeartHandshake,
            content: 'Your data is as safe as your pet in our arms. We never share your personal information with third parties. All payments are securely encrypted.'
        }
    };

    const active = sections[section] || sections['shipping'];

    return (
        <div className="bg-white min-h-screen pt-32 pb-32">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Sidebar Nav */}
                <nav className="lg:col-span-4 space-y-8">
                    <h1 className="text-4xl font-serif text-black mb-12">Customer Care</h1>
                    <div className="flex flex-col space-y-2">
                        {Object.keys(sections).map((key) => {
                            const Icon = sections[key].icon;
                            return (
                                <Link 
                                    key={key}
                                    to={`/policy/${key}`} 
                                    className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === key ? 'bg-[#95714F] text-white shadow-lg' : 'hover:bg-[#F8F4F0] text-[#95714F]'}`}
                                >
                                    <Icon size={20} />
                                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">{sections[key].title}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Content Area */}
                <main className="lg:col-span-8 bg-[#F8F4F0] p-12 lg:p-20 rounded-sm">
                     <active.icon size={48} className="text-[#8C916C] mb-10" />
                     <h2 className="text-4xl font-serif text-black mb-10">{active.title}</h2>
                     <div className="prose prose-lg text-[#95714F] leading-relaxed space-y-8">
                         <p>{active.content}</p>
                         <p>
                             Our team is dedicated to providing the best experience for both you and your furry companion. 
                             If you have any specific questions that aren't addressed here, please don't hesitate to reach out 
                             to our support team.
                         </p>
                         <div className="pt-10 border-t border-[#C7AF94]/30">
                             <p className="text-sm font-bold text-black uppercase tracking-widest mb-4">Contact Support</p>
                             <p className="text-sm">support@tutuandco.com</p>
                             <p className="text-sm">Mon - Fri: 9am - 6pm EST</p>
                         </div>
                     </div>
                </main>
            </div>
        </div>
    );
};

export default Policy;
