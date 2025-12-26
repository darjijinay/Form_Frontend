import React, { useState } from 'react';

const YourLogoComponent = ({ logoUrl }) => {
  const [imgSrc, setImgSrc] = useState(logoUrl);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  const fallbackUrl = '/default-logo.png'; // Place a default logo in your public folder

  const handleError = () => {
    if (!hasTriedFallback) {
      setImgSrc(fallbackUrl);
      setHasTriedFallback(true);
    }
  };

  return (
    <img src={imgSrc} onError={handleError} alt="Logo" />
  );
};

export default YourLogoComponent;
