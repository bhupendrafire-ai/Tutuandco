
import React from 'react';
import { Ruler, CheckCircle2, Info } from 'lucide-react';

const Sizing = () => {
    return (
        <div className="bg-brand-sage min-h-screen pt-32 pb-32 font-sans">
            <div className="max-w-[1440px] mx-auto px-6">
                
                {/* Top Section: 2-Column Grouping */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-24 mb-20 items-start">
                    
                    {/* Left side: Heading, Description & How to measure */}
                    <div className="space-y-12">
                        <header>
                            <span className="text-[11px] font-bold text-brand-charcoal opacity-40 mb-4 block uppercase tracking-widest">Fitting guide</span>
                            <h1 className="text-5xl md:text-7xl font-medium text-brand-charcoal mb-8 leading-[1.1] tracking-tight">Size guide</h1>
                            <p className="text-brand-charcoal/60 text-xl font-normal leading-relaxed max-w-xl">
                                Finding the right fit for your pet is important — a comfortable bandana is a happy bandana ✨
                            </p>
                        </header>

                        <section className="pt-10 border-t border-brand-charcoal/5">
                            <div className="flex items-center mb-6">
                                <div className="w-9 h-9 bg-brand-cream rounded-full flex items-center justify-center mr-4 shadow-sm border border-brand-charcoal/5">
                                    <span className="text-sm font-bold text-brand-charcoal">1</span>
                                </div>
                                <h3 className="text-[13px] font-bold text-brand-charcoal uppercase tracking-widest">How to measure</h3>
                            </div>
                            <div className="pl-13 space-y-4">
                                <p className="text-brand-charcoal/60 leading-relaxed text-[16px]">
                                    Use a soft measuring tape and measure around your pet’s neck where the bandana would naturally sit (not too tight, not too loose).
                                </p>
                                <p className="text-brand-charcoal/60 leading-relaxed text-[16px]">
                                    Make sure you can comfortably fit two fingers between the tape and your pet’s neck.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Right side: Sizing note inside subtle card */}
                    <div className="bg-brand-cream/60 backdrop-blur-sm p-10 rounded-sm shadow-sm border border-brand-charcoal/5 self-start lg:mt-12">
                        <div className="flex items-center text-brand-charcoal opacity-40 mb-8 font-bold text-[10px] uppercase tracking-widest">
                            <Info size={14} className="mr-2" />
                            Sizing advice
                        </div>
                        <p className="text-brand-charcoal/80 text-xl italic leading-relaxed mb-8 font-medium">
                            "If your pet is between sizes, we recommend sizing up for comfort."
                        </p>
                        <div className="w-full h-[1px] bg-brand-charcoal/10 mb-8" />
                        <ul className="space-y-4">
                            {['Adjustable snap button levels', 'Anti-rust high-quality buttons', 'Comfort-first design'].map((tip, i) => (
                                <li key={i} className="flex items-center text-sm font-medium text-brand-charcoal/60">
                                    <CheckCircle2 size={16} className="mr-3 text-brand-charcoal/20" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Size Chart - Tightened Density */}
                <section className="mb-20">
                    <div className="flex items-center space-x-4 mb-10">
                        <Ruler size={18} className="text-brand-charcoal opacity-30" />
                        <h2 className="text-[13px] font-bold text-brand-charcoal/40 uppercase tracking-widest">Size chart</h2>
                    </div>
                    <div className="overflow-x-auto bg-brand-cream/30 rounded-sm border border-brand-charcoal/5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-charcoal/10 text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest bg-brand-cream/20">
                                    <th className="py-4 px-8">Size</th>
                                    <th className="py-4 px-8">Neck size</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-charcoal/5">
                                {[
                                    { size: 'Small', neck: '20 – 30 cm (8 – 12 in)' },
                                    { size: 'Medium', neck: '30 – 40 cm (12 – 16 in)' }
                                ].map((row, i) => (
                                    <tr key={i} className="text-brand-charcoal/60 hover:bg-white/40 transition-colors">
                                        <td className="py-4 px-8 font-bold text-brand-charcoal/80 text-sm">{row.size}</td>
                                        <td className="py-4 px-8 text-sm">{row.neck}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Pet Finder Section - side-by-side cards with reduced padding */}
                <section>
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-medium text-brand-charcoal mb-2">Find your pet’s size</h2>
                        <p className="text-brand-charcoal/40 text-sm">General guidelines for a perfect fit.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                        <div className="bg-brand-cream/60 p-8 rounded-sm shadow-sm border border-brand-charcoal/5 flex flex-col items-center text-center">
                            <span className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-[0.2em] mb-4">The essentials</span>
                            <h4 className="text-xl font-medium text-brand-charcoal mb-4 italic">Small (S)</h4>
                            <p className="text-brand-charcoal/60 text-[15px] leading-relaxed font-medium">
                                Ideal for Shih Tzu, Lhasa Apso, Pug, Toy Poodle, Dachshund, and most adult cats.
                            </p>
                        </div>
                        <div className="bg-brand-cream/60 p-8 rounded-sm shadow-sm border border-brand-charcoal/5 flex flex-col items-center text-center">
                            <span className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-[0.2em] mb-4">The signature</span>
                            <h4 className="text-xl font-medium text-brand-charcoal mb-4 italic">Medium (M)</h4>
                            <p className="text-brand-charcoal/60 text-[15px] leading-relaxed font-medium">
                                Ideal for Beagle, Indie, Cocker Spaniel, French Bulldog, and smaller Indies.
                            </p>
                        </div>
                    </div>
                    
                    <p className="mt-12 text-[10px] text-brand-charcoal/30 font-medium tracking-widest text-center uppercase">
                        (Always measure your pet for the best fit)
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Sizing;
