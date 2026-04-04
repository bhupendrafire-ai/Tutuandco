import React from 'react';

import BrandCat from '../assets/brand-cat.svg?react';

const IconCat = ({ size = 14, className = "", color = "currentColor" }) => {
  return (
    <div 
      style={{ 
        width: size, 
        height: size, 
        display: 'block',
        color: color 
      }} 
      className={className}
    >
      <BrandCat 
        width="100%" 
        height="100%" 
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default IconCat;
