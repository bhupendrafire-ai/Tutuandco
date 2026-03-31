
import React from 'react';
import { Ruler, CheckCircle2, Info } from 'lucide-react';

const Sizing = () => {
    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32">
            <div className="max-w-5xl mx-auto px-6">
                <header className="mb-20">
                    <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-brand-charcoal opacity-60 mb-6 block">Fitting Guide</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-brand-charcoal mb-12">Size Guide</h1>
                    <p className="text-brand-charcoal/70 text-xl font-light leading-relaxed max-w-2xl">
                        Finding the right fit for your pet is important — a comfortable bandana is a happy bandana ✨
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-32">
                    <div className="space-y-12">
                        <section>
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-brand-cream rounded-full flex items-center justify-center mr-4 shadow-sm">
                                    <span className="font-serif font-bold text-brand-charcoal">1</span>
                                </div>
                                <h3 className="text-xl font-bold text-brand-charcoal uppercase tracking-wider">How to Measure</h3>
                            </div>
                            <p className="text-brand-charcoal/70 leading-relaxed pl-14">
                                Use a soft measuring tape and measure around your pet’s neck where the bandana would naturally sit (not too tight, not too loose).
                                <br /><br />
                                Make sure you can comfortably fit two fingers between the tape and your pet’s neck.
                            </p>
                        </section>
                    </div>

                    <div className="bg-brand-cream/80 backdrop-blur-sm p-10 rounded-sm shadow-sm">
                        <div className="flex items-center text-brand-charcoal opacity-60 mb-8 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <Info size={16} className="mr-2" />
                            Sizing Advice
                        </div>
                        <p className="text-brand-charcoal italic font-serif text-lg leading-relaxed mb-8">
                            "If your pet is between sizes, we recommend sizing up for comfort."
                        </p>
                        <div className="w-full h-px bg-brand-charcoal/10 mb-8" />
                        <ul className="space-y-4">
                            {['Adjustable snap button levels', 'Anti-rust high-quality buttons', 'Comfort-first design'].map((tip, i) => (
                                <li key={i} className="flex items-center text-sm text-brand-charcoal/70">
                                    <CheckCircle2 size={16} className="mr-3 text-brand-charcoal/40" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Size Table */}
                <section className="mb-32">
                    <h2 className="text-3xl font-serif text-brand-charcoal mb-12">Size Chart</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-charcoal/10 text-[10px] uppercase font-bold text-brand-charcoal opacity-60 tracking-widest">
                                    <th className="py-6 pr-6">Size</th>
                                    <th className="py-6 px-6">Neck Size</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-charcoal/5">
                                {[
                                    { size: 'Small', neck: '20 – 30 cm (8 – 12 in)' },
                                    { size: 'Medium', neck: '30 – 40 cm (12 – 16 in)' }
                                ].map((row, i) => (
                                    <tr key={i} className="text-brand-charcoal/70 hover:bg-brand-cream/50 transition-colors">
                                        <td className="py-6 pr-6 font-bold text-brand-charcoal">{row.size}</td>
                                        <td className="py-6 px-6">{row.neck}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Pet Guides */}
                <section>
                    <h2 className="text-3xl font-serif text-brand-charcoal mb-12">Find Your Pet’s Size</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-brand-cream p-8 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <h4 className="text-xl font-serif text-brand-charcoal mb-4">Small (S)</h4>
                            <p className="text-brand-charcoal/70 text-sm leading-relaxed">
                                Ideal for smaller pets such as: Shih Tzu, Lhasa Apso, Pug, Toy Poodle, Dachshund, most adult cats
                            </p>
                        </div>
                        <div className="bg-brand-cream p-8 rounded-sm shadow-sm border border-brand-charcoal/5">
                            <h4 className="text-xl font-serif text-brand-charcoal mb-4">Medium (M)</h4>
                            <p className="text-brand-charcoal/70 text-sm leading-relaxed">
                                Ideal for medium-sized pets such as: Indie (Indian Pariah), Beagle, Cocker Spaniel, French Bulldog, small Indies and mixed breeds
                            </p>
                        </div>
                    </div>
                    <p className="mt-8 text-[10px] text-brand-charcoal/40 uppercase tracking-widest text-center">
                        (These are general guidelines — always measure your pet for the best fit.)
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Sizing;
