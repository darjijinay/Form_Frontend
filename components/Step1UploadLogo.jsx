import React, { useState } from 'react';

const Step1UploadLogo = ({ formData, setFormData }) => {
  const [uploading, setUploading] = useState(false);

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const formDataObj = new FormData();
    formDataObj.append('logo', file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-logo`, {
        method: 'POST',
        body: formDataObj,
      });
      const data = await res.json();
      if (data.logoUrl) {
        setFormData({ ...formData, logo: data.logoUrl });
      }
    } catch (err) {
      // handle error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleLogoChange} />
      {uploading && <span>Uploading...</span>}
      {formData.logo && (
        <img src={formData.logo} alt="Uploaded Logo" style={{ width: 96, height: 96 }} />
      )}
    </div>
  );
};

export default Step1UploadLogo;
