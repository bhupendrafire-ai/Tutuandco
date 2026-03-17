
import React from 'react';
import { Ruler, CheckCircle2, Info } from 'lucide-react';

const Sizing = () => {
    return (
        <div className="bg-white min-h-screen pt-32 pb-32">
            <div className="max-w-5xl mx-auto px-6">
                <header className="mb-20">
                    <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-[#8C916C] mb-6 block">Fitting Guide</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-black mb-12">How to Measure</h1>
                    <p className="text-[#95714F] text-xl font-light leading-relaxed max-w-2xl">
                        Ensuring the perfect fit for your pet is essential for their comfort and safety. Follow our guide to find the ideal size.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-32">
                    <div className="space-y-12">
                        <section>
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-[#F8F4F0] rounded-full flex items-center justify-center mr-4">
                                    <span className="font-serif font-bold">1</span>
                                </div>
                                <h3 className="text-xl font-bold text-black uppercase tracking-wider">The Neck</h3>
                            </div>
                            <p className="text-[#95714F] leading-relaxed pl-14">
                                Measure around the base of the neck where a collar would naturally sit. Ensure you can fit two fingers comfortably between the tape and your pet.
                            </p>
                        </section>
                        <section>
                            <div className="flex items-center mb-6">
                                <div className="w-10 h-10 bg-[#F8F4F0] rounded-full flex items-center justify-center mr-4">
                                    <span className="font-serif font-bold">2</span>
                                </div>
                                <h3 className="text-xl font-bold text-black uppercase tracking-wider">The Girth (Chest)</h3>
                            </div>
                            <p className="text-[#95714F] leading-relaxed pl-14">
                                Measure the widest part of your pet's chest, typically right behind the front legs. This is the most critical measurement for harnesses.
                            </p>
                        </section>
                    </div>

                    <div className="bg-[#F8F4F0] p-10 rounded-sm">
                        <div className="flex items-center text-[#8C916C] mb-8 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <Info size={16} className="mr-2" />
                            Pro Tip
                        </div>
                        <p className="text-black italic font-serif text-lg leading-relaxed mb-8">
                            "If your pet is between sizes, we always recommend sizing up for freedom of movement."
                        </p>
                        <div className="w-full h-px bg-[#C7AF94]/30 mb-8" />
                        <ul className="space-y-4">
                            {['Use a flexible tailoring tape', 'Measure while they are standing', 'Avoid pulling the tape too tight'].map((tip, i) => (
                                <li key={i} className="flex items-center text-sm text-[#95714F]">
                                    <CheckCircle2 size={16} className="mr-3 text-[#8C916C]" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Size Table */}
                <section>
                    <h2 className="text-3xl font-serif text-black mb-12">Universal Chart</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#C7AF94]/30 text-[10px] uppercase font-bold text-[#8C916C] tracking-widest">
                                    <th className="py-6 pr-6">Size</th>
                                    <th className="py-6 px-6">Neck (inches)</th>
                                    <th className="py-6 px-6">Chest (inches)</th>
                                    <th className="py-6 pl-6 text-right">Typical Breeds</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F8F4F0]">
                                {[
                                    { size: 'XS', neck: '8-10', chest: '12-14', breeds: 'Chihuahua, Tea Cup Yorkie' },
                                    { size: 'S', neck: '10-12', chest: '14-17', breeds: 'Dachshund, Maltese' },
                                    { size: 'M', neck: '12-14', chest: '17-20', breeds: 'Frenchie, Pug, Beagle' },
                                    { size: 'L', neck: '14-18', chest: '20-24', breeds: 'Golden Retriever, Lab' }
                                ].map((row, i) => (
                                    <tr key={i} className="text-[#95714F] hover:bg-[#F8F4F0]/50 transition-colors">
                                        <td className="py-6 pr-6 font-bold text-black">{row.size}</td>
                                        <td className="py-6 px-6">{row.neck}</td>
                                        <td className="py-6 px-6">{row.chest}</td>
                                        <td className="py-6 pl-6 text-right text-xs">{row.breeds}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Sizing;
