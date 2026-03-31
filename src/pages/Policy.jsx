
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, RefreshCw, Truck, HeartHandshake, Ruler } from 'lucide-react';
/* Icons removed from display per user request */

const Policy = () => {
    const { section } = useParams();

    const sections = {
        'sizing': {
            title: 'Sizing Guide',
            icon: Ruler,
            content: (
                <div className="space-y-10">
                    <p className="text-xl italic font-serif text-brand-charcoal leading-relaxed">"Finding the right fit for your pet is important — a comfortable bandana is a happy bandana ✨"</p>

                    <div>
                        <h3 className="text-2xl font-serif text-brand-charcoal mt-10 mb-6 underline underline-offset-8">How to Measure</h3>
                        <div className="space-y-4">
                            <p>Use a soft measuring tape and measure around your pet’s neck where the bandana would naturally sit <span className="text-brand-charcoal opacity-80">(not too tight, not too loose).</span></p>
                            <div className="bg-brand-cream/50 p-6 border-l-4 border-brand-charcoal/30">
                                <p className="text-sm italic">"Make sure you can comfortably fit two fingers between the tape and your pet’s neck."</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-serif text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Size Chart</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-brand-charcoal/10 text-[11px] uppercase font-medium text-brand-charcoal tracking-wider">
                                        <th className="py-4 pr-6 opacity-80">Size</th>
                                        <th className="py-4 px-6 text-right opacity-80">Neck Size</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-charcoal/5">
                                    <tr className="text-brand-charcoal/70">
                                        <td className="py-4 pr-6 font-medium text-brand-charcoal">Small</td>
                                        <td className="py-4 px-6 text-right">20 – 30 cm (8 – 12 in)</td>
                                    </tr>
                                    <tr className="text-brand-charcoal/70">
                                        <td className="py-4 pr-6 font-medium text-brand-charcoal">Medium</td>
                                        <td className="py-4 px-6 text-right">30 – 40 cm (12 – 16 in)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs italic mt-6 text-brand-charcoal/60 font-medium">(If your pet is between sizes, we recommend sizing up for comfort.)</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-serif text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Find Your Pet’s Size</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-brand-cream/30 p-8 rounded-sm">
                                <h4 className="font-medium text-brand-charcoal uppercase tracking-wider text-[11px] mb-4">Small (S)</h4>
                                <p className="text-sm leading-relaxed text-brand-charcoal/70">Ideal for smaller pets such as: Shih Tzu, Lhasa Apso, Pug, Toy Poodle, Dachshund, most adult cats</p>
                            </div>
                            <div className="bg-brand-cream/30 p-8 rounded-sm">
                                <h4 className="font-medium text-brand-charcoal uppercase tracking-widest text-xs mb-4">Medium (M)</h4>
                                <p className="text-sm leading-relaxed text-brand-charcoal/70">Ideal for medium-sized pets such as: Indie (Indian Pariah), Beagle, Cocker Spaniel, French Bulldog, small Indies and mixed breeds</p>
                            </div>
                        </div>
                        <p className="text-xs italic mt-6 text-brand-charcoal/40 font-medium">General guidelines — always measure your pet for the best fit.</p>
                    </div>

                    <div className="pt-10 border-t border-brand-charcoal/10 mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-4">Adjustable Fit</h3>
                            <p className="text-sm">Each bandana comes with two adjustable snap button levels, allowing you to customise the fit as needed.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-4">Hardware Quality</h3>
                            <p className="text-sm italic text-brand-charcoal/70">"The buttons are high-quality, anti-tarnish snaps designed for durability and everyday wear."</p>
                        </div>
                    </div>

                    <div className="bg-brand-cream/50 p-10 rounded-sm shadow-sm">
                        <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-6">Fit Tips</h3>
                        <ul className="space-y-4 text-sm text-brand-charcoal/80">
                            <li className="flex items-center">• Fluffy pets may need a slightly larger size</li>
                            <li className="flex items-center">• For growing pets, consider sizing up</li>
                            <li className="flex items-center">• The bandana should sit comfortably without restricting movement</li>
                        </ul>
                    </div>

                    <div className="pt-10 border-t border-brand-charcoal/10">
                         <h4 className="font-medium text-brand-charcoal uppercase tracking-widest text-xs mb-4">Still Unsure?</h4>
                         <p className="text-sm italic text-brand-charcoal/70">We’re happy to help! Reach out to us at <span className="font-medium text-brand-charcoal underline">support@tutuandco.com</span> or DM us on Instagram with your pet’s breed and measurements.</p>
                    </div>
                </div>
            )
        },
        'shipping': {
            title: 'Shipping Policy',
            icon: Truck,
            content: (
                <div className="space-y-8">
                    <p className="text-xl italic font-serif text-brand-charcoal leading-relaxed">"We’re excited to get your Tutu & Co order to you ✨"</p>

                    <div>
                        <h3 className="text-2xl font-serif text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Order Processing</h3>
                        <p>All orders are processed within 1–3 business days. Since each piece is carefully prepared, slight delays during high-demand periods may occur.</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-serif text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Shipping Time</h3>
                        <p className="mb-4">Once dispatched, orders typically arrive within:</p>
                        <ul className="list-disc pl-5 space-y-2 mb-8 text-brand-charcoal/70">
                            <li><span className="font-medium text-brand-charcoal">2–5 business days</span> for metro cities</li>
                            <li><span className="font-medium text-brand-charcoal">3–7 business days</span> for other locations</li>
                        </ul>
                        <p className="text-sm italic">Delivery timelines may vary depending on your location and courier partner.</p>
                    </div>

                    <div className="bg-brand-cream/50 p-10 rounded-sm border-l-4 border-brand-charcoal/30 my-12">
                        <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-6">Shipping Charges</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-brand-charcoal/10 pb-4">
                                <span>Flat shipping fee</span>
                                <span className="font-medium text-brand-charcoal">₹89</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-brand-charcoal">Orders over ₹999</span>
                                <span className="font-medium text-brand-charcoal">FREE</span>
                            </div>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest mt-6 text-brand-charcoal/40">Shipping charges (if applicable) will be calculated at checkout.</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-serif text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Order Tracking</h3>
                        <p>Once your order is shipped, you’ll receive a tracking link via email or SMS to follow its journey.</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-serif text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Delays & Issues</h3>
                        <p>While we work with reliable delivery partners, delays can occasionally happen due to factors beyond our control. If your order is significantly delayed, feel free to reach out to us at <span className="font-medium text-brand-charcoal underline">support@tutuandco.com</span>.</p>
                    </div>

                    <div className="pt-10 border-t border-brand-charcoal/10 mt-12">
                         <h4 className="font-medium text-brand-charcoal uppercase tracking-widest text-xs mb-2 italic">Incorrect Address</h4>
                         <p className="italic text-sm">Please ensure your shipping details are accurate at checkout. We are not responsible for delays or failed deliveries due to incorrect information.</p>
                    </div>
                </div>
            )
        },
        'returns': {
            title: 'Returns & Exchanges',
            icon: RefreshCw,
            content: (
                <div className="space-y-8">
                    <p className="text-xl italic font-serif text-brand-charcoal leading-relaxed">"We want you and your pet to love your Tutu & Co purchase. If something isn’t quite right, we’re here to help."</p>

                    <div>
                        <h3 className="text-2xl font-serif text-brand-charcoal mt-10 mb-6 underline underline-offset-8">Exchanges</h3>
                        <p className="mb-4">We offer limited exchanges for size or defects.</p>
                        <ul className="list-disc pl-5 space-y-2 mb-8">
                            <li>Size exchange requests must be raised within 48 hours of delivery</li>
                            <li>Only one exchange per order is allowed</li>
                        </ul>

                        <h4 className="font-medium text-brand-charcoal uppercase tracking-widest text-xs mb-4">To be eligible:</h4>
                        <ul className="list-disc pl-5 space-y-2 mb-8">
                            <li>The product must be unused, unwashed, and in original condition</li>
                            <li>Free from pet hair, odour, or any signs of wear</li>
                            <li>All tags and packaging must be intact</li>
                        </ul>

                        <div className="bg-brand-cream/50 p-6 rounded-sm border-l-4 border-brand-charcoal/30 mb-8">
                            <p className="font-medium text-brand-charcoal text-xs uppercase tracking-widest mb-2">Please note:</p>
                            <ul className="space-y-2 text-sm italic">
                                <li>• Exchange shipping costs are to be borne by the customer</li>
                                <li>• We recommend checking our size guide carefully before purchase, as fit may vary based on breed and fur type</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-brand-charcoal/10 mt-12">
                        <h3 className="text-2xl font-serif text-brand-charcoal mb-6">Returns</h3>
                        <p>As a small, made-with-care brand, we currently do not offer returns or refunds, unless the item received is damaged or incorrect.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-serif text-brand-charcoal mb-4">Damaged or Incorrect Orders</h3>
                        <p>If you receive a damaged or wrong item, please contact us within 48 hours of delivery with photos, and we’ll make it right.</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-serif text-brand-charcoal mb-4">Exchange Process</h3>
                        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-brand-charcoal/60">Once your request is approved:</p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>The product will need to be shipped back to us</li>
                            <li>The replacement will be processed after a quality check</li>
                        </ol>
                    </div>

                    <div className="pt-10 border-t border-brand-charcoal/10">
                         <h4 className="font-medium text-brand-charcoal uppercase tracking-widest text-xs mb-2 italic">A Small Note</h4>
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
                    <p className="text-xl italic font-serif text-brand-charcoal leading-relaxed">"Each Tutu & Co piece is thoughtfully made to be worn, loved, and lived in. With a little care, it’ll stay just as special."</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-4">Washing</h3>
                            <p>Machine wash on a gentle cycle with similar colours using mild detergent. Avoid bleach.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-4">Drying</h3>
                            <p>Air dry for best results, or tumble dry on low.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-4">Ironing</h3>
                            <p>If needed, use a low heat setting.</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-4">Storage</h3>
                            <p>Store in a clean, dry place when not in use.</p>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-brand-charcoal/10 mt-12">
                        <h3 className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-4">A Small Note</h3>
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
                    <h3 className="text-2xl font-serif text-brand-charcoal mt-8 mb-4">1. Information We Collect</h3>
                    <p>We collect personal information that you voluntarily provide to us when you place an order, sign up for our newsletter, or contact us. This may include your name, email address, phone number, shipping and billing address, and payment details.</p>
                    
                    <h3 className="text-2xl font-serif text-brand-charcoal mt-8 mb-4">2. How We Use Your Information</h3>
                    <p>Your information is used to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Process and fulfill your orders</li>
                        <li>Communicate with you regarding your purchases or inquiries</li>
                        <li>Provide customer support</li>
                        <li>Send updates, offers, or newsletters (only if you opt in)</li>
                    </ul>
                    <p className="mt-4">We only use your information for purposes that improve your experience with our brand.</p>

                    <h3 className="text-2xl font-serif text-brand-charcoal mt-8 mb-4">3. Information Sharing</h3>
                    <p>We respect your privacy. Your personal information is never sold, traded, or rented to third parties.</p>
                    <p>We may share necessary details with trusted partners (such as payment processors and delivery services) strictly to fulfill your orders.</p>

                    <h3 className="text-2xl font-serif text-brand-charcoal mt-8 mb-4">4. Data Security</h3>
                    <p>We take appropriate measures to protect your personal information. All payment transactions are processed through secure, encrypted gateways to ensure your data remains safe.</p>

                    <h3 className="text-2xl font-serif text-brand-charcoal mt-8 mb-4">5. Cookies</h3>
                    <p>Our website uses cookies to enhance your browsing experience. These help us understand how you interact with our site, remember your preferences, and improve functionality. You can choose to disable cookies through your browser settings.</p>
                </div>
            )
        }
    };

    const active = sections[section] || sections['shipping'];

    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* Sidebar Nav */}
                <nav className="lg:col-span-4 space-y-8">
                    <h1 className="text-4xl font-serif text-black mb-12">Customer Care</h1>
                    <div className="flex flex-col space-y-2">
                        {Object.keys(sections).map((key) => (
                            <Link 
                                key={key}
                                to={`/policy/${key}`} 
                                className={`flex items-center space-x-4 p-6 rounded-sm transition-all ${section === key ? 'bg-brand-charcoal text-white shadow-lg' : 'hover:bg-brand-cream/50 text-brand-charcoal'}`}
                            >
                                <span className="text-[10px] uppercase font-medium tracking-[0.2em]">{sections[key].title}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Content Area */}
                <main className="lg:col-span-8 bg-brand-cream p-12 lg:p-20 rounded-sm shadow-sm">
                     <h2 className="text-4xl font-serif text-brand-charcoal mb-10">{active.title}</h2>
                     <div className="prose prose-lg text-brand-charcoal/80 leading-relaxed space-y-8">
                         {typeof active.content === 'string' ? <p>{active.content}</p> : active.content}
                         <p>
                             Our team is dedicated to providing the best experience for both you and your furry companion. 
                             If you have any specific questions that aren't addressed here, please don't hesitate to reach out 
                             to our support team.
                         </p>
                          <div className="pt-10 border-t border-brand-charcoal/10">
                             <p className="text-sm font-medium text-brand-charcoal uppercase tracking-widest mb-4">Contact Support</p>
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
