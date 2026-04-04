
import React from 'react';
import { Ruler, CheckCircle2, Info } from 'lucide-react';

const Sizing = () => {
    return (
        <div className="bg-brand-sage min-h-screen lg:h-screen lg:overflow-hidden pt-32 lg:pt-0 pb-12 lg:pb-0 flex flex-col justify-center font-sans relative">
            <div className="max-w-[1440px] mx-auto px-6 w-full">
                
                {/* Visual Anchor: 2-Column Viewport Refactor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-32 items-center">
                    
                    {/* Left Column: Heading, Description & How to measure */}
                    <div className="space-y-10 lg:space-y-16">
                        <header>
                            <span className="text-[10px] font-bold text-brand-charcoal opacity-40 mb-3 block uppercase tracking-widest">Fitting guide</span>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-brand-charcoal mb-6 leading-[1.05] tracking-tight">Size guide</h1>
                            <p className="text-brand-charcoal/60 text-lg leading-relaxed max-w-sm">
                                Finding the right fit for your pet is important — a comfortable bandana is a happy bandana ✨
                            </p>
                        </header>

                        <section className="pt-10 border-t border-brand-charcoal/5 max-w-sm">
                            <div className="flex items-center mb-5">
                                <div className="w-8 h-8 bg-brand-cream rounded-full flex items-center justify-center mr-4 shadow-sm border border-brand-charcoal/5">
                                    <span className="text-xs font-bold text-brand-charcoal">1</span>
                                </div>
                                <h3 className="text-[11px] font-bold text-brand-charcoal uppercase tracking-widest">How to measure</h3>
                            </div>
                            <div className="pl-12 space-y-4">
                                <p className="text-brand-charcoal/60 leading-relaxed text-[15px] font-medium">
                                    Measure around your pet’s neck comfortably where the bandana naturally sits. 
                                </p>
                                <p className="text-brand-charcoal/60 leading-relaxed text-[15px] font-medium">
                                    Ensure two fingers fit between the tape and neck.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sizing note, Inline Chart & Finder Cards */}
                    <div className="space-y-6 lg:space-y-10">
                        {/* Advice Card */}
                        <div className="bg-brand-cream/60 backdrop-blur-sm p-8 rounded-sm shadow-sm border border-brand-charcoal/5 w-full">
                            <div className="flex items-center text-brand-charcoal opacity-40 mb-6 font-bold text-[9px] uppercase tracking-widest">
                                <Info size={14} className="mr-2" />
                                Sizing advice
                            </div>
                            <p className="text-brand-charcoal/80 text-xl italic leading-relaxed mb-6 font-medium">
                                "If your pet is between sizes, we recommend sizing up for comfort."
                            </p>
                            <div className="flex flex-wrap gap-4 pt-6 border-t border-brand-charcoal/5">
                                {['Adjustable fit', 'Premium buttons', 'Comfort design'].map((tip, i) => (
                                    <div key={i} className="flex items-center text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">
                                        <CheckCircle2 size={13} className="mr-2 opacity-50" />
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size Chart - Converted to Horizontal Bar for Viewport Efficiency */}
                        <div className="bg-brand-cream/30 p-6 rounded-sm border border-brand-charcoal/5 flex flex-wrap justify-between items-center px-10">
                            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                                <Ruler size={16} className="text-brand-charcoal opacity-30" />
                                <span className="text-[10px] font-bold text-brand-charcoal/30 uppercase tracking-widest">Size chart</span>
                            </div>
                            <div className="flex space-x-12">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-1.5">Small</span>
                                    <span className="text-[15px] font-bold text-brand-charcoal/70">20–30 cm</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-brand-charcoal/30 uppercase tracking-widest mb-1.5">Medium</span>
                                    <span className="text-[15px] font-bold text-brand-charcoal/70">30–40 cm</span>
                                </div>
                            </div>
                        </div>

                        {/* Pet Finder Section - side-by-side cards with minimal vertical padding */}
                        <div className="grid grid-cols-2 gap-4 lg:gap-8">
                            <div className="bg-brand-cream/60 p-6 rounded-sm shadow-sm border border-brand-charcoal/5 flex flex-col items-center text-center justify-center">
                                <h4 className="text-sm font-bold text-brand-charcoal mb-2 italic">Small (S)</h4>
                                <p className="text-brand-charcoal/60 text-[12px] leading-tight font-medium">
                                    Shih Tzu, Pug, Dachshund, Cats.
                                </p>
                            </div>
                            <div className="bg-brand-cream/60 p-6 rounded-sm shadow-sm border border-brand-charcoal/5 flex flex-col items-center text-center justify-center">
                                <h4 className="text-sm font-bold text-brand-charcoal mb-2 italic">Medium (M)</h4>
                                <p className="text-brand-charcoal/60 text-[12px] leading-tight font-medium">
                                    Beagle, Indie, Frenchie, Indies.
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-[10px] text-brand-charcoal/30 font-medium tracking-widest text-center uppercase">
                            (Always measure your pet for the best fit)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sizing;
