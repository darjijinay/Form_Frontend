// frontend/custom-form-next/src/components/fields/ImageChoiceField.jsx
import { useState, useEffect } from 'react';

export default function ImageChoiceField({ field, value, onChange }) {
  const [images, setImages] = useState(field.options || []);

  useEffect(() => {
    setImages(field.options || []);
  }, [field.options]);

  const handleImageUpload = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedImages = [...images];
      updatedImages[index] = {
        ...images[index],
        url: reader.result,
      };
      setImages(updatedImages);
    };
    reader.readAsDataURL(file);
  };

  const handleSelect = (imageId) => {
    onChange(imageId === value ? null : imageId);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-900">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className={`relative border-2 rounded-lg cursor-pointer overflow-hidden transition ${
              value === image.id ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
            }`}
            onClick={() => handleSelect(image.id)}
          >
            {image.url ? (
              <img
                src={image.url}
                alt={image.label || `Option ${index + 1}`}
                className="w-full h-32 object-cover"
              />
            ) : (
              <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 text-xs">No image</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
              {image.label || `Option ${index + 1}`}
            </div>
            {value === image.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20">
                <span className="text-blue-600 font-bold text-lg">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {field.required && !value && <p className="text-sm text-red-500">Please select an option</p>}
    </div>
  );
}
