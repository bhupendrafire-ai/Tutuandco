import React, { useState } from 'react';
import { MessageSquare, X, Send, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePolicy, htmlToReadableText } from '../context/ShopContext';

/**
 * Chatbot - Conversational AI Assistant.
 * Integrated with the Sizing Guide System for automated knowledge retrieval.
 */
const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { policy } = usePolicy('sizing_guide');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Tutu, your pet styling assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const suggestions = [
        { label: "Sizing Guide", link: "/policies/sizing" },
        { label: "Shipping Info", link: "/policies/shipping" },
        { label: "Return Policy", link: "/policies/returns" }
    ];

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const newUserMsg = { id: Date.now(), text: userText, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Intelligence Engine: Detect intent and resolve via Core Policies
        setTimeout(() => {
            let botText = "I'm not sure about that, but our team can help! Email us at hello.tutuandco@gmail.com";
            const lower = userText.toLowerCase();

            if (lower.includes('size') || lower.includes('fit') || lower.includes('measure')) {
                if (policy?.content) {
                    const readableSizing = htmlToReadableText(policy.content);
                    botText = `Here is our current sizing guide:\n\n${readableSizing}\n\nWe recommend choosing the larger size if your pet is between measurements.`;
                } else {
                    botText = "Our sizing guide is currently being updated. Generally, we offer Small and Medium sizes for most products.";
                }
            } else if (lower.includes('ship') || lower.includes('delivery') || lower.includes('cost')) {
                botText = "We ship worldwide! Orders over ₹999 get free shipping. Standard shipping in India is ₹89. Most orders arrive in 3-5 business days.";
            } else if (lower.includes('return') || lower.includes('exchange') || lower.includes('refund')) {
                botText = "As a small brand, we offer exchanges for damaged or incorrect items within 48 hours of delivery. Items must be unused with tags attached.";
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: botText, sender: 'bot' }]);
        }, 800);
    };

    return (
        <div className="fixed bottom-10 right-10 z-[1000]">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-brand-cream w-[380px] h-[600px] shadow-2xl rounded-sm flex flex-col overflow-hidden border border-brand-charcoal/10"
                    >
                        {/* Header */}
                        <div className="bg-brand-charcoal p-6 text-white flex justify-between items-center shadow-md">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-medium text-lg text-white font-serif">Tutu</h3>
                                    <div className="px-1.5 py-0.5 bg-brand-rose/20 rounded-full border border-brand-rose/30 flex items-center space-x-1">
                                        <Sparkles size={8} className="text-brand-rose" />
                                        <span className="text-[8px] font-bold text-brand-rose uppercase tracking-tighter">AI Knowledge Base</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-[10px] font-medium opacity-60 mt-1 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                                    Online now
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity"><X size={20} /></button>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-brand-sage/10 relative">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 text-[13px] leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-brand-charcoal text-white rounded-l-lg rounded-tr-lg shadow-sm font-medium' : 'bg-white text-brand-charcoal rounded-r-lg rounded-tl-lg shadow-sm border border-brand-charcoal/5 font-normal'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {/* Suggestions */}
                            <div className="pt-4 flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <Link 
                                        key={i} 
                                        to={s.link} 
                                        onClick={() => setIsOpen(false)}
                                        className="text-[10px] font-bold bg-white border border-brand-charcoal/5 px-4 py-2.5 rounded-full text-brand-charcoal/60 hover:bg-brand-charcoal hover:text-white transition-all flex items-center shadow-sm uppercase tracking-wider"
                                    >
                                        {s.label} <ChevronRight size={10} className="ml-1.5" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-brand-charcoal/10 flex gap-2">
                            <input 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="How can I help you styling?" 
                                className="flex-grow p-4 text-sm focus:outline-none bg-transparent text-brand-charcoal font-medium"
                            />
                            <button type="submit" className="bg-brand-charcoal text-white px-5 py-4 rounded-sm hover:opacity-90 transition-opacity">
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="bg-brand-charcoal text-white p-5 rounded-full shadow-2xl flex items-center justify-center hover:bg-black transition-all relative border-4 border-white/20"
                    >
                        <MessageSquare size={24} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-rose rounded-full border-2 border-white shadow-sm" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
