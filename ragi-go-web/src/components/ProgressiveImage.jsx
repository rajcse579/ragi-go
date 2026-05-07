import React, { useState } from 'react';
import './ProgressiveImage.css';

export default function ProgressiveImage({ src, alt, className, style }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div 
      className={`progressive-image-container ${className || ''} ${isLoaded ? 'loaded' : 'loading'}`}
      style={style}
    >
      {/* Placeholder - a subtle gradient that feels like the brand */}
      <div className="progressive-placeholder"></div>
      
      <img
        src={src}
        alt={alt}
        className={`progressive-img ${isLoaded ? 'visible' : 'hidden'}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}
