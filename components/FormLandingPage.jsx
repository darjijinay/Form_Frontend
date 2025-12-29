import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const FormLandingPage = ({ formData }) => {
  // ...existing code...

  // Assume formData.logo contains the uploaded logo URL
  const logoUrl = formData?.logo;

  // Assume formData.publicUrl contains the public link to the form
  const publicUrl = formData?.publicUrl || window.location.href;
  const qrRef = useRef();

  // Copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert('Link copied to clipboard!');
  };

  // Download QR code as image
  const handleDownloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-qr.png';
    a.click();
  };

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

      {/* Share section */}
      <div style={{ margin: '32px 0', textAlign: 'center' }}>
        <h3>Share this form</h3>
        <div style={{ margin: '16px 0' }}>
          <input
            type="text"
            value={publicUrl}
            readOnly
            style={{ width: '70%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginRight: 8 }}
          />
          <button onClick={handleCopyLink} style={{ padding: '8px 16px', borderRadius: 4, background: '#4f46e5', color: '#fff', border: 'none' }}>Copy Link</button>
        </div>
        <div ref={qrRef} style={{ display: 'inline-block', margin: '16px 0' }}>
          <QRCodeCanvas value={publicUrl} size={160} includeMargin={true} />
        </div>
        <div>
          <button onClick={handleDownloadQR} style={{ padding: '8px 16px', borderRadius: 4, background: '#10b981', color: '#fff', border: 'none', marginTop: 8 }}>Download QR Code</button>
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
          Share the link or QR code above to let others access this form.
        </div>
      </div>
      {/* ...existing code... */}
    </div>
  );
};

export default FormLandingPage;