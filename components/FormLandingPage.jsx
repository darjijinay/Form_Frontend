import React from 'react';

const FormLandingPage = ({ formData }) => {
  // ...existing code...

  // Assume formData.logo contains the uploaded logo URL
  const logoUrl = formData?.logo;

  return (
    <div>
      {/* ...existing code... */}
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Form Logo"
          style={{ width: 96, height: 96, objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      {/* ...existing code... */}
    </div>
  );
};

export default FormLandingPage;