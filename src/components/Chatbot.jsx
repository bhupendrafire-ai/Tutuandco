
import React, { useState } from 'react';
import { MessageSquare, X, Send, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm Tutu, your pet styling assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const suggestions = [
        { label: "Sizing Help", link: "/sizing" },
        { label: "Shipping Info", link: "/policy/shipping" },
        { label: "Return Policy", link: "/policy/returns" },
        { label: "How to Measure", link: "/sizing" }
    ];

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');

        // Automated responses
        setTimeout(() => {
            let botText = "I'm not sure about that, but our team can help! Email us at support@tutuandco.com";
            const lower = inputValue.toLowerCase();
            
            if (lower.includes('sizing') || lower.includes('measure')) {
                botText = "I can definitely help with sizing! check out our detailed How to Measure guide here.";
            } else if (lower.includes('ship') || lower.includes('delivery')) {
                botText = "We ship worldwide! Orders over $999 get free shipping. Standard shipping is $89.";
            } else if (lower.includes('return')) {
                botText = "We have a 30-day return policy. Items must be unused and have tags attached.";
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
                        className="bg-white w-[380px] h-[550px] shadow-2xl rounded-sm flex flex-col overflow-hidden border border-[#C7AF94]/30"
                    >
                        {/* Header */}
                        <div className="bg-[#95714F] p-6 text-white flex justify-between items-center">
                            <div>
                                <h3 className="font-serif text-lg">Tutu Assistant</h3>
                                <div className="flex items-center text-[10px] opacity-80 uppercase tracking-widest mt-1">
                                    <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                                    Online
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity"><X size={20} /></button>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#F8F4F0]/50">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 text-sm ${msg.sender === 'user' ? 'bg-[#95714F] text-white rounded-l-lg rounded-tr-lg shadow-sm' : 'bg-white text-[#95714F] rounded-r-lg rounded-tl-lg shadow-sm'}`}>
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
                                        className="text-[10px] uppercase font-bold tracking-widest bg-white border border-[#C7AF94]/30 px-3 py-2 rounded-full text-[#95714F] hover:bg-[#95714F] hover:text-white transition-all flex items-center shadow-sm"
                                    >
                                        {s.label} <ChevronRight size={10} className="ml-1" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#C7AF94]/20 flex gap-2">
                            <input 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..." 
                                className="flex-grow p-3 text-sm focus:outline-none"
                            />
                            <button type="submit" className="bg-[#95714F] text-white p-3 rounded-sm hover:bg-[#8C916C] transition-colors">
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="bg-[#95714F] text-white p-5 rounded-full shadow-2xl flex items-center justify-center hover:bg-[#8C916C] transition-colors relative"
                    >
                        <MessageSquare size={24} />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chatbot;
