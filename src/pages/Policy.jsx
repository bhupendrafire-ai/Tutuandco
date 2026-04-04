
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, RefreshCw, Truck, HeartHandshake, Ruler } from 'lucide-react';
/* Icons removed from display per user request */

const Policy = () => {
    const { section } = useParams();

    const sections = {
        'shipping': {
            title: 'Shipping Policy',
            icon: Truck,
            content: (
                <div className="space-y-8">
                    <p className="text-xl italic text-brand-charcoal leading-relaxed">"We’re excited to get your Tutu & Co order to you ✨"</p>

                    <div>
                        <h3 className="text-2xl text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Order Processing</h3>
                        <p>All orders are processed within 1–3 business days. Since each piece is carefully prepared, slight delays during high-demand periods may occur.</p>
                    </div>

                    <div>
                        <h3 className="text-2xl text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Shipping Time</h3>
                        <p className="mb-4">Once dispatched, orders typically arrive within:</p>
                        <ul className="list-disc pl-5 space-y-2 mb-8 text-brand-charcoal/70">
                            <li><span className="font-medium text-brand-charcoal">2–5 business days</span> for metro cities</li>
                            <li><span className="font-medium text-brand-charcoal">3–7 business days</span> for other locations</li>
                        </ul>
                        <p className="text-sm italic">Delivery timelines may vary depending on your location and courier partner.</p>
                    </div>

                    <div className="bg-brand-cream/50 p-10 rounded-sm border-l-4 border-brand-charcoal/30 my-12">
                        <p className="text-[11px] mt-6 text-brand-charcoal/40 font-medium">Shipping charges (if applicable) will be calculated at checkout.</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-medium text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Order tracking</h3>
                        <p>Once your order is shipped, you’ll receive a tracking link via email or SMS to follow its journey.</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-medium text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Delays & issues</h3>
                        <p>While we work with reliable delivery partners, delays can occasionally happen due to factors beyond our control. If your order is significantly delayed, feel free to reach out to us at <span className="font-medium text-brand-charcoal underline">support@tutuandco.com</span>.</p>
                    </div>

                    <div className="pt-10 border-t border-brand-charcoal/10 mt-12">
                         <h4 className="font-medium text-brand-charcoal text-xs mb-2 italic">Incorrect address</h4>
                         <p className="italic text-sm">Please ensure your shipping details are accurate at checkout. We are not responsible for delays or failed deliveries due to incorrect information.</p>
                    </div>
                </div>
            )
        },
        'returns': {
            title: 'Returns & Exchanges',
            icon: RefreshCw,
            content: (
                <div className="space-y-12">
                    <section>
                        <h3 className="text-2xl font-medium text-brand-charcoal mb-6">Returns</h3>
                        <p className="mb-6">As a small, made-with-care brand, we currently do not offer returns or refunds, unless the item received is damaged or incorrect.</p>
                        
                        <h4 className="font-medium text-brand-charcoal text-xs mb-4">To be eligible for exchange:</h4>
                        <ul className="list-disc pl-5 space-y-4 mb-8">
                            <li>The product must be unused, unwashed, and in original condition</li>
                            <li>Free from pet hair, odour, or any signs of wear</li>
                            <li>All tags and packaging must be intact</li>
                        </ul>

                        <div className="bg-brand-cream/50 p-6 rounded-sm border-l-4 border-brand-charcoal/30 mb-8">
                            <p className="font-medium text-brand-charcoal text-xs mb-2">Please note:</p>
                            <ul className="space-y-2 text-sm italic">
                                <li>• Exchange shipping costs are to be borne by the customer</li>
                                <li>• Check our size guide carefully before purchase for the best fit</li>
                            </ul>
                        </div>
                    </section>

                    <section className="pt-10 border-t border-brand-charcoal/10">
                        <h3 className="text-xl font-medium text-brand-charcoal mb-4">Damaged or incorrect orders</h3>
                        <p>If you receive a damaged or wrong item, please contact us within 48 hours of delivery with photos, and we’ll make it right.</p>
                    </section>

                    <section className="pt-10 border-t border-brand-charcoal/10">
                        <h3 className="text-xl font-medium text-brand-charcoal mb-4">Exchange process</h3>
                        <p className="mb-4 text-xs font-medium text-brand-charcoal/60">Once your request is approved:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>The product will need to be shipped back to us</li>
                            <li>The replacement will be processed after a quality check</li>
                        </ol>
                    </section>

                    <div className="pt-10 border-t border-brand-charcoal/10">
                         <h4 className="font-medium text-brand-charcoal text-xs mb-2 italic">A small note</h4>
                         <p className="italic text-sm">Each piece is handmade, so slight variations are natural and not considered defects.</p>
                    </div>
                </div>
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
        },
        'privacy': {
            title: 'Privacy Policy',
            icon: HeartHandshake,
            content: (
                <div className="space-y-6">
                    <h3 className="text-2xl font-medium text-brand-charcoal mt-8 mb-4">1. Information We Collect</h3>
                    <p>We collect personal information that you voluntarily provide to us when you place an order, sign up for our newsletter, or contact us. This may include your name, email address, phone number, shipping and billing address, and payment details.</p>
                    
                    <h3 className="text-2xl font-medium text-brand-charcoal mt-8 mb-4">2. How We Use Your Information</h3>
                    <p>Your information is used to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Process and fulfill your orders</li>
                        <li>Communicate with you regarding your purchases or inquiries</li>
                        <li>Provide customer support</li>
                        <li>Send updates, offers, or newsletters (only if you opt in)</li>
                    </ul>
                    <p className="mt-4">We only use your information for purposes that improve your experience with our brand.</p>

                    <h3 className="text-2xl font-medium text-brand-charcoal mt-8 mb-4">3. Information Sharing</h3>
                    <p>We respect your privacy. Your personal information is never sold, traded, or rented to third parties.</p>
                    <p>We may share necessary details with trusted partners (such as payment processors and delivery services) strictly to fulfill your orders.</p>

                    <h3 className="text-2xl font-medium text-brand-charcoal mt-8 mb-4">4. Data Security</h3>
                    <p>We take appropriate measures to protect your personal information. All payment transactions are processed through secure, encrypted gateways to ensure your data remains safe.</p>

                    <h3 className="text-2xl font-medium text-brand-charcoal mt-8 mb-4">5. Cookies</h3>
                    <p>Our website uses cookies to enhance your browsing experience. These help us understand how you interact with our site, remember your preferences, and improve functionality. You can choose to disable cookies through your browser settings.</p>
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
                                to={`/policy/${key}`} 
                                className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === key ? 'bg-brand-rose text-brand-charcoal shadow-md' : 'hover:bg-brand-cream/50 text-brand-charcoal'}`}
                            >
                                <span className="text-[11px] font-medium tracking-wide">{sections[key].title}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Content Area */}
                <main className="lg:col-span-8 bg-brand-cream p-12 lg:p-20 rounded-sm shadow-sm">
                     <h2 className="text-4xl font-medium text-brand-charcoal mb-10">{active.title}</h2>
                     <div className="prose prose-lg text-brand-charcoal/80 leading-relaxed space-y-8">
                         {typeof active.content === 'string' ? <p>{active.content}</p> : active.content}
                         <p>
                             Our team is dedicated to providing the best experience for both you and your furry companion. 
                             If you have any specific questions that aren't addressed here, please don't hesitate to reach out 
                             to our support team.
                         </p>
                          <div className="pt-10 border-t border-brand-charcoal/10">
                             <p className="text-sm font-medium text-brand-charcoal mb-4">Contact support</p>
                             <p className="text-sm">support@tutuandco.com</p>
                             <p className="text-sm">Mon - Fri: 9am - 6pm EST</p>
                             <div className="pt-10 border-t border-brand-charcoal/10 mt-10">
                                 <p className="text-sm text-brand-charcoal/80">
                                     Tutu & Co · Operated by Filter Works (Proprietorship) · GSTIN: 27ABYPW0381K1ZQ
                                 </p>
                             </div>
                         </div>
                     </div>
                </main>
            </div>
        </div>
    );
};

export default Policy;
