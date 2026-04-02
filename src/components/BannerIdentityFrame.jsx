import React, { useRef, useState, useEffect } from 'react';
import { getProductImage } from '../context/ShopContext';

/**
 * BannerIdentityFrame: The Unified Geometry Engine
 * This component locks parity between the Storefront, Hub, and Manager Card.
 * It uses a tethered coordinate system (1920x1080) to ensure identical cropping.
 */
const BannerIdentityFrame = ({ 
    banner, 
    media, 
    children, 
    className = "", 
    imageClassName = "",
    onInteractionProps = {} // Passed to image container for Hub panning
}) => {
    const containerRef = useRef(null);
    const [scale, setScale] = useState({ x: 1, y: 1 });

    useEffect(() => {
        const updateScale = () => {
             if (containerRef.current) {
                 const rect = containerRef.current.getBoundingClientRect();
                 // Universal Parity Math: Map pixels to reference 1920x1080 canvas
                 setScale({
                     x: rect.width / (banner.refWidth || 1920),
                     y: rect.height / (banner.refHeight || 1080)
                 });
             }
        };
        
        updateScale();
        const timer = setTimeout(updateScale, 150); // Delayed sync for complex layouts
        window.addEventListener('resize', updateScale);
        
        return () => {
            window.removeEventListener('resize', updateScale);
            clearTimeout(timer);
        };
    }, [banner, banner.refWidth, banner.refHeight]);

    const transformStyle = {
        transform: `translate(${(banner.translateX || 0) * scale.x}px, ${(banner.translateY || 0) * scale.y}px) scale(${banner.zoom || 1})`,
        objectFit: banner.fitMode || 'cover'
    };

    return (
        <div className={`flex flex-col md:flex-row w-full h-full overflow-hidden bg-brand-sage ${className}`}>
             {/* Image Perspective Section (65%) */}
             <div 
                ref={containerRef}
                className={`relative w-full md:w-[65%] h-full overflow-hidden bg-brand-sage ${imageClassName}`}
                style={{ aspectRatio: '832 / 810' }}
                {...onInteractionProps}
             >
                {banner.image ? (
                    <img 
                        src={getProductImage(banner.image, media)} 
                        className="w-full h-full block origin-center pointer-events-none select-none"
                        style={transformStyle}
                        alt=""
                        draggable={false}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-charcoal/10 uppercase text-[10px] font-bold tracking-[0.2em]">
                        No Asset Assigned
                    </div>
                )}
                
                {/* Universal 4% Soft Bleed Divider */}
                <div 
                    className="absolute top-0 right-0 bottom-0 w-[4%] pointer-events-none z-10"
                    style={{
                        background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(124, 132, 108, 0.08) 30%, rgba(124, 132, 108, 0.18) 55%, rgba(124, 132, 108, 0.3) 75%, rgba(124, 132, 108, 0.5) 100%)'
                    }}
                />
             </div>

             {/* CTA Panel Section (35%) */}
             <div className="w-full md:w-[35%] bg-brand-sage flex flex-col justify-center">
                 {children}
             </div>
        </div>
    );
};

export default BannerIdentityFrame;
