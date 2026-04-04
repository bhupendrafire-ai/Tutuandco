import React from 'react';

const IconCat = ({ size = 14, className = "", color = "currentColor" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={color} 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* 
        Official Brand Mascot Silhouette (DTC Premium Rebuild)
        Optimized for 12-16px legibility.
      */}
      <path d="M12 11.5c-1.5-1.5-4.5-1.5-4.5-4.5 0-2 1.5-3.5 3.5-3.5.5 0 1 .2 1.5.5.5-.3 1-.5 1.5-.5 2 0 3.5 1.5 3.5 3.5 0 3-3 3-4.5 4.5zm-4-8L9.5 1l1.5 2.5H8zm8 0l-1.5-2.5L13 3.5h3zM12 13a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5 5c2 0 3.5-1.5 3.5-3.5s-1.5-3.5-3.5-3.5c-1 0-2.2.5-2.2 1.5s1.2 1.5 2.2 1.5 1.5-.5 1.5-1-.5-1-1-1" />
    </svg>
  );
};

export default IconCat;
