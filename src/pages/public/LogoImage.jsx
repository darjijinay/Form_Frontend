import React, { useState, useEffect } from 'react';

// Prevent infinite fallback loop for logo image
export default function LogoImage({ src }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFallback(false);
  }, [src]);

  return (
    <div className="flex-shrink-0">
      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt="Logo"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => {
            if (!fallback) {
              setImgSrc('https://via.placeholder.com/96?text=Logo');
              setFallback(true);
            }
          }}
        />
      </div>
    </div>
  );
}
