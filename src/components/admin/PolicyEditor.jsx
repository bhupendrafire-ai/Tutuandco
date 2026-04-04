import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Undo2, Bold, List, ChevronDown, Heading2, Heading3, Table as TableIcon } from 'lucide-react';

/**
 * PolicyEditor - A strictly controlled HTML editor for policies.
 * Enforces a strict tag whitelist and purges all attributes/styles.
 */
const PolicyEditor = ({ label, value, onChange, onReset, onRollback, hasUnsavedChanges, isExpanded, onToggle }) => {
    const editorRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    useEffect(() => {
        if (isExpanded && containerRef.current) {
            const timer = setTimeout(() => {
                containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);

    /**
     * strictNormalizeHTML - Recursively cleans HTML to enforce whitelist and remove all attributes.
     */
    const strictNormalizeHTML = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        const whitelist = ['H2', 'H3', 'P', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'UL', 'LI', 'STRONG', 'EM', 'B', 'I'];
        
        const clean = (node) => {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                if (child.nodeType === 1) { // Element
                    if (!whitelist.includes(child.tagName)) {
                        // Replace unallowed tag with its own children
                        const fragment = document.createDocumentFragment();
                        while (child.firstChild) fragment.appendChild(child.firstChild);
                        node.replaceChild(fragment, child);
                        clean(node);
                    } else {
                        // Strip all attributes
                        while (child.attributes.length > 0) {
                            child.removeAttribute(child.attributes[0].name);
                        }
                        // Normalize tag name (e.g., B -> STRONG)
                        if (child.tagName === 'B') {
                            const strong = document.createElement('strong');
                            while (child.firstChild) strong.appendChild(child.firstChild);
                            node.replaceChild(strong, child);
                            clean(strong);
                        } else if (child.tagName === 'I') {
                            const em = document.createElement('em');
                            while (child.firstChild) em.appendChild(child.firstChild);
                            node.replaceChild(em, child);
                            clean(em);
                        } else {
                            clean(child);
                        }
                    }
                }
            }
        };

        clean(temp);
        return temp.innerHTML.replace(/&nbsp;/g, ' ').trim();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const raw = editorRef.current.innerHTML;
            const normalized = strictNormalizeHTML(raw);
            onChange(normalized);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleInput();
    };

    const execCommand = (cmd, val = null) => {
        document.execCommand(cmd, false, val);
        handleInput();
    };

    const insertTable = () => {
        const tableHtml = `
            <table>
                <thead>
                    <tr><th>Size</th><th>Neck (cm)</th><th>Length (cm)</th></tr>
                </thead>
                <tbody>
                    <tr><td>Small</td><td>20-30</td><td>15</td></tr>
                    <tr><td>Medium</td><td>30-40</td><td>20</td></tr>
                </tbody>
            </table>
        `;
        execCommand('insertHTML', tableHtml);
    };

    return (
        <div 
            ref={containerRef} 
            className={`rounded-sm border overflow-hidden transition-all duration-500 ${isExpanded ? 'border-brand-charcoal/20 bg-white shadow-xl translate-y-[-4px]' : 'border-brand-charcoal/5 bg-brand-cream/5 hover:bg-white'}`}
        >
            {/* Header */}
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

            {/* Content Slot */}
            <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mb-8' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-8 space-y-6">
                        {/* Advanced Rich Text Toolbar */}
                        <div className="flex justify-between items-center py-4 border-b border-brand-charcoal/5">
                            <div className="flex items-center space-x-1">
                                <button onClick={() => execCommand('formatBlock', 'h2')} className="p-2.5 hover:bg-brand-sage/20 rounded-sm text-brand-charcoal/60 hover:text-brand-charcoal transition-all" title="Heading 2"><Heading2 size={16} /></button>
                                <button onClick={() => execCommand('formatBlock', 'h3')} className="p-2.5 hover:bg-brand-sage/20 rounded-sm text-brand-charcoal/60 hover:text-brand-charcoal transition-all" title="Heading 3"><Heading3 size={16} /></button>
                                <div className="w-px h-4 bg-brand-charcoal/10 mx-1" />
                                <button onClick={() => execCommand('bold')} className="p-2.5 hover:bg-brand-sage/20 rounded-sm text-brand-charcoal/60 hover:text-brand-charcoal transition-all" title="Bold"><Bold size={16} /></button>
                                <button onClick={() => execCommand('insertUnorderedList')} className="p-2.5 hover:bg-brand-sage/20 rounded-sm text-brand-charcoal/60 hover:text-brand-charcoal transition-all" title="Bullet List"><List size={16} /></button>
                                <div className="w-px h-4 bg-brand-charcoal/10 mx-1" />
                                <button onClick={insertTable} className="p-2.5 hover:bg-brand-sage/20 rounded-sm text-brand-charcoal/60 hover:text-brand-rose transition-all flex items-center gap-2" title="Insert Sizing Table"><TableIcon size={16} /><span className="text-[10px] font-bold uppercase tracking-wider">Sizing Table</span></button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={onRollback}
                                    className="flex items-center space-x-2 px-3 py-2 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/40 hover:text-brand-charcoal text-[9px] font-bold uppercase tracking-widest group/btn"
                                    title="Rollback to last saved version"
                                >
                                    <Undo2 size={12} className="group-hover/btn:-rotate-45 transition-transform" />
                                    <span>Rollback</span>
                                </button>
                                
                                <button 
                                    onClick={onReset}
                                    className="flex items-center space-x-2 px-3 py-2 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/40 hover:text-red-500 text-[9px] font-bold uppercase tracking-widest"
                                    title="Reset to original content"
                                >
                                    <RotateCcw size={12} />
                                    <span>Reset</span>
                                </button>
                            </div>
                        </div>

                        {/* Editor Surface */}
                        <div 
                            ref={editorRef}
                            contentEditable
                            onInput={handleInput}
                            onPaste={handlePaste}
                            onBlur={handleInput}
                            className="w-full min-h-[400px] bg-brand-sage/5 p-10 font-normal text-base border border-transparent focus:border-brand-rose/10 outline-none transition-all rounded-sm prose prose-sm max-w-none text-brand-charcoal/80 policy-editor-surface policy-content"
                            style={{ whiteSpace: 'pre-wrap' }}
                        />
                        
                        <div className="flex justify-between items-center text-[9px] text-brand-charcoal/30 italic uppercase tracking-widest font-bold pb-4 border-t border-brand-charcoal/5 pt-4">
                            <span>Strict Normalization Active: Whitelisted Tags Only</span>
                            <span>Purging Attributes & Inline Styles</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <style sx>{`
                .policy-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 16px;
                    font-size: 14px;
                }
                .policy-content thead {
                    background: rgba(0, 0, 0, 0.03);
                }
                .policy-content th {
                    text-align: left;
                    font-weight: 500;
                    padding: 12px 16px;
                    letter-spacing: 0.04em;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                .policy-content td {
                    padding: 14px 16px;
                }
                .policy-content tr {
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                }
                .policy-content h2 { margin-top: 2rem; color: #1a1a1a; font-weight: 500; }
                .policy-content h3 { margin-top: 1.5rem; color: #1a1a1a; font-weight: 500; }
            `}</style>
        </div>
    );
};

export default PolicyEditor;
