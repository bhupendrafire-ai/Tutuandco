import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Undo2, Bold, List } from 'lucide-react';

/**
 * PolicyEditor - A strictly controlled minimal HTML editor for legal policies.
 * Ensures design consistency by stripping all unapproved tags and styles.
 */
const PolicyEditor = ({ label, value, onChange, onReset, onRollback, hasUnsavedChanges }) => {
    const editorRef = useRef(null);

    // Initial sync - using a ref-based approach for performance and to avoid cursor jumping
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    /**
     * Sanitizes HTML to only allow specific tags: p, br, strong, ul, ol, li, b
     * Strips all attributes (styles) and unallowed elements (div, span).
     */
    const sanitizeHTML = (html) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Allowed tags for minimal policy content
        const allowedTags = ['P', 'BR', 'STRONG', 'UL', 'OL', 'LI', 'B'];
        
        const clean = (node) => {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                if (child.nodeType === 1) { // Element node
                    if (!allowedTags.includes(child.tagName)) {
                        // Replace unallowed tag with its children (unwrap it)
                        const fragment = document.createDocumentFragment();
                        while (child.firstChild) fragment.appendChild(child.firstChild);
                        node.replaceChild(fragment, child);
                        clean(node); // Re-process from this level
                    } else {
                        // Strip all attributes (styles, classes, etc.) to enforce design system
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

    /**
     * Handles content changes by sanitizing and emitting up to the parent.
     */
    const handleInput = () => {
        if (editorRef.current) {
            const raw = editorRef.current.innerHTML;
            const sanitized = sanitizeHTML(raw);
            onChange(sanitized);
        }
    };

    /**
     * Intercepts paste events to strip ALL external formatting immediately.
     */
    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        
        // Use insertText to avoid bringing in extra tags from complex clipboards
        document.execCommand('insertText', false, text);
        handleInput();
    };

    /**
     * Executes standard browser editor commands.
     */
    const execCommand = (cmd) => {
        document.execCommand(cmd, false, null);
        handleInput();
    };

    return (
        <div className={`space-y-4 p-8 rounded-sm border transition-all ${hasUnsavedChanges ? 'border-brand-rose bg-brand-rose/5' : 'border-brand-charcoal/5 bg-white shadow-sm'}`}>
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-brand-charcoal/40 uppercase tracking-widest">{label}</label>
                    {hasUnsavedChanges && <span className="text-[9px] font-bold text-brand-rose tracking-wider uppercase mt-1">Unsaved Policy Changes</span>}
                </div>
                
                <div className="flex items-center space-x-2">
                    {/* Formatting Controls */}
                    <button 
                        onClick={() => execCommand('bold')}
                        className="p-2 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/60"
                        title="Bold"
                    >
                        <Bold size={14} />
                    </button>
                    <button 
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/60"
                        title="Bullet List"
                    >
                        <List size={14} />
                    </button>
                    
                    <div className="w-[1px] h-4 bg-brand-charcoal/10 mx-2" />
                    
                    {/* Safety Controls */}
                    <button 
                        onClick={onRollback}
                        className="flex items-center space-x-1 px-3 py-2 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/40 hover:text-brand-charcoal text-[10px] font-bold uppercase tracking-widest group"
                        title="Rollback to last saved version"
                    >
                        <Undo2 size={12} className="group-hover:-rotate-45 transition-transform" />
                        <span>Rollback</span>
                    </button>
                    
                    <button 
                        onClick={onReset}
                        className="flex items-center space-x-1 px-3 py-2 hover:bg-brand-cream rounded-sm transition-all text-brand-charcoal/40 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest"
                        title="Reset to brand original (hardcoded)"
                    >
                        <RotateCcw size={12} />
                        <span>Reset Default</span>
                    </button>
                </div>
            </div>
            
            {/* The Editor Instance */}
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onBlur={handleInput} // Ensure final sync on exit
                className="w-full min-h-[150px] bg-brand-cream/30 p-8 font-normal text-base border-none outline-none focus:ring-1 focus:ring-brand-rose/20 rounded-sm prose prose-sm max-w-none text-brand-charcoal/80"
                style={{ whiteSpace: 'pre-wrap' }}
            />
            
            <div className="flex justify-between items-center text-[9px] text-brand-charcoal/30 italic uppercase tracking-widest font-bold">
                <span>Sanitization Active • Tags: P, BR, B, STRONG, UL, LI</span>
                <span>Design System Protection (Strict)</span>
            </div>
        </div>
    );
};

export default PolicyEditor;
