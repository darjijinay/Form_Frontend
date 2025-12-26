"use client";
import { useState } from 'react';
import FormRenderer from '../forms/FormRenderer';

const DEVICE_SIZES = {
  mobile: { width: '375px', label: 'Mobile', icon: '📱' },
  tablet: { width: '768px', label: 'Tablet', icon: '📱' },
  desktop: { width: '100%', label: 'Desktop', icon: '💻' },
};

export default function PreviewPanel({ form, isOpen, onClose }) {
  const [deviceType, setDeviceType] = useState('desktop');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-800">Form Preview</h2>
              
              {/* Device Selector */}
              <div className="flex gap-2 bg-white rounded-lg p-1 border border-slate-200">
                {Object.entries(DEVICE_SIZES).map(([key, device]) => (
                  <button
                    key={key}
                    onClick={() => setDeviceType(key)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      deviceType === key
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="mr-1">{device.icon}</span>
                    {device.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl px-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto bg-slate-100 p-8">
          <div className="flex justify-center">
            <div
              style={{ 
                width: DEVICE_SIZES[deviceType].width,
                maxWidth: '100%',
              }}
              className="bg-white rounded-xl shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                {/* Form Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {form.title || 'Untitled Form'}
                  </h1>
                  {form.description && (
                    <p className="text-slate-600">{form.description}</p>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {form.fields && form.fields.length > 0 ? (
                    <FormRenderer form={form} isPreview={true} />
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <p>No fields added yet</p>
                      <p className="text-sm mt-2">Add fields to see the preview</p>
                    </div>
                  )}
                </div>

                {/* Submit Button Preview */}
                {form.fields && form.fields.length > 0 && (
                  <div className="mt-6">
                    <button
                      disabled
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium cursor-not-allowed opacity-75"
                    >
                      Submit (Preview Mode)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-4">
              <span>📊 {form.fields?.length || 0} fields</span>
              <span>
                📐 {deviceType === 'mobile' ? '375px' : deviceType === 'tablet' ? '768px' : 'Full Width'}
              </span>
            </div>
            <p className="text-slate-500">
              This is a preview - no data will be submitted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
