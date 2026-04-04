import React from 'react';

const Terms = () => {
    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-[800px] mx-auto px-6">
                <main className="bg-brand-cream p-12 lg:p-20 rounded-sm shadow-sm">
                    <h1 className="text-4xl font-medium text-brand-charcoal mb-12">Terms & Conditions</h1>
                    
                    <div className="prose prose-lg text-brand-charcoal/80 leading-relaxed space-y-10">
                        <section>
                            <h2 className="text-xl font-medium text-brand-charcoal mb-4">1. Introduction</h2>
                            <p>
                                Welcome to Tutu & Co. By accessing our website and purchasing our products, you agree to comply 
                                with and be bound by the following terms and conditions. Please read them carefully.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-medium text-brand-charcoal mb-4">2. Use of the Website</h2>
                            <p>
                                This website is provided for your personal, non-commercial use. You may not use this site for any 
                                purpose that is unlawful or prohibited by these terms. 
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-medium text-brand-charcoal mb-4">3. Product Information</h2>
                            <p>
                                We strive to provide accurate descriptions and images of our products. However, due to the handmade 
                                nature of our items and variations in screen displays, slight differences may occur. 
                                Prices and availability are subject to change without notice.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-medium text-brand-charcoal mb-4">4. Orders & Payments</h2>
                            <p>
                                All orders are subject to acceptance and availability. We reserve the right to refuse or cancel 
                                any order. Payments are processed securely through our authorized payment gateways.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-medium text-brand-charcoal mb-4">5. Intellectual Property</h2>
                            <p>
                                All content on this website, including designs, text, and images, is the property of Tutu & Co 
                                and is protected by copyright and intellectual property laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-medium text-brand-charcoal mb-4">6. Limitation of Liability</h2>
                            <p>
                                Tutu & Co shall not be liable for any direct, indirect, or consequential damages resulting from 
                                the use of our products or website.
                            </p>
                        </section>

                        <div className="mt-16 text-sm text-brand-charcoal/80 leading-relaxed">
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
