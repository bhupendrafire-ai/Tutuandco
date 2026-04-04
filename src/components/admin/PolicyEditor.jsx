import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Undo2, Bold, List, ChevronDown } from 'lucide-react';

/**
 * PolicyEditor - A strictly controlled minimal HTML editor for legal policies.
 * Enhanced with accordion UI and smart auto-scroll for better usability.
 */
const PolicyEditor = ({ label, value, onChange, onReset, onRollback, hasUnsavedChanges, isExpanded, onToggle }) => {
    const editorRef = useRef(null);
    const containerRef = useRef(null);

    // Initial sync - using a ref-based approach to avoid re-renders during active editing
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    // Smart Auto-Scroll: When expanded, scroll this section into top of viewport
    useEffect(() => {
        if (isExpanded && containerRef.current) {
            // Slight delay to allow the accordion opening animation to initiate
            const timer = setTimeout(() => {
                containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);

    /**
     * Sanitizes HTML to only allow specific tags: p, br, strong, ul, ol, li, b
     * Strips all attributes (styles) and unallowed elements (div, span).
     */
    const sanitizeHTML = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        const allowedTags = ['P', 'BR', 'STRONG', 'UL', 'OL', 'LI', 'B'];
        
        const clean = (node) => {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                if (child.nodeType === 1) { // Element node
                    if (!allowedTags.includes(child.tagName)) {
                        const fragment = document.createDocumentFragment();
                        while (child.firstChild) fragment.appendChild(child.firstChild);
                        node.replaceChild(fragment, child);
                        clean(node);
                    } else {
                        while (child.attributes.length > 0) {
                            child.removeAttribute(child.attributes[0].name);
                        }
                        clean(child);
                    }
                }
            }
        };

        clean(temp);
        return temp.innerHTML;
    };

    const handleInput = () => {
        if (editorRef.current) {
            const raw = editorRef.current.innerHTML;
            const sanitized = sanitizeHTML(raw);
            onChange(sanitized);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleInput();
    };

    const execCommand = (cmd) => {
        document.execCommand(cmd, false, null);
        handleInput();
    };

    return (
        <div 
            ref={containerRef} 
            className={`rounded-sm border overflow-hidden transition-all duration-300 ${isExpanded ? 'border-brand-charcoal/20 bg-white shadow-md' : 'border-brand-charcoal/5 bg-brand-cream/10 hover:bg-white'}`}
        >
            {/* Minimal Accordion Header */}
            <div 
                onClick={onToggle}
                className="p-6 flex justify-between items-center cursor-pointer select-none group"
            >
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest pointer-events-none transition-colors group-hover:text-brand-charcoal/60">{label}</label>
                    {hasUnsavedChanges && !isExpanded && <span className="text-[9px] font-bold text-brand-rose tracking-wider uppercase mt-1 animate-pulse">Unsaved Changes</span>}
                </div>
                <div className={`transition-all duration-500 flex items-center ${isExpanded ? 'rotate-180 text-brand-rose' : 'text-brand-charcoal/20 group-hover:text-brand-charcoal'}`}>
                    <ChevronDown size={18} strokeWidth={3} />
                </div>
            </div>

            {/* Accordion Content with CSS Grid Animation (Lag-free) */}
            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-8 pt-0 space-y-6">
                        {/* Expanded Toolbar Area */}
                        <div className="flex justify-between items-center pb-4 border-b border-brand-charcoal/5">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-brand-charcoal/20 uppercase tracking-widest">Editing Mode</span>
                                {hasUnsavedChanges && <span className="text-[9px] font-bold text-brand-rose tracking-widest uppercase">Pending Commits</span>}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => execCommand('bold')}
                                    className="p-3 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/60 hover:text-brand-charcoal"
                                    title="Bold"
                                >
                                    <Bold size={14} />
                                </button>
                                <button 
                                    onClick={() => execCommand('insertUnorderedList')}
                                    className="p-3 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/60 hover:text-brand-charcoal"
                                    title="Bullet List"
                                >
                                    <List size={14} />
                                </button>
                                
                                <div className="w-[1px] h-4 bg-brand-charcoal/10 mx-2" />
                                
                                <button 
                                    onClick={onRollback}
                                    className="flex items-center space-x-2 px-3 py-2 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/40 hover:text-brand-charcoal text-[10px] font-bold uppercase tracking-widest group/btn"
                                    title="Rollback to last saved version"
                                >
                                    <Undo2 size={12} className="group-hover/btn:-rotate-45 transition-transform" />
                                    <span>Rollback</span>
                                </button>
                                
                                <button 
                                    onClick={onReset}
                                    className="flex items-center space-x-2 px-3 py-2 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/40 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest"
                                    title="Reset to brand original"
                                >
                                    <RotateCcw size={12} />
                                    <span>Reset Default</span>
                                </button>
                            </div>
                        </div>

                        {/* Editor Canvas */}
                        <div 
                            ref={editorRef}
                            contentEditable
                            onInput={handleInput}
                            onPaste={handlePaste}
                            onBlur={handleInput}
                            className="w-full min-h-[300px] bg-brand-cream/30 p-8 font-normal text-base border-none outline-none focus:ring-1 focus:ring-brand-rose/20 rounded-sm prose prose-sm max-w-none text-brand-charcoal/80"
                            style={{ whiteSpace: 'pre-wrap' }}
                        />
                        
                        <div className="flex justify-between items-center text-[9px] text-brand-charcoal/20 italic uppercase tracking-widest font-bold pt-4 border-t border-brand-charcoal/5">
                            <span>Safe Content Layer Active</span>
                            <span>Design Protection Enforced</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyEditor;
