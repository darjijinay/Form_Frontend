"use client";
import { useState } from 'react';
import axiosClient from '../../api/axiosClient';

export default function Step1FormDetails({ form, onUpdate }) {
  const fieldTypeOptions = ['Short Text', 'Email', 'Number', 'Long Text', 'Date', 'Time'];
  // isScratch: true if form is not based on a template (even if it has an _id)
  const isScratch = !form?.template;
  const [newDetail, setNewDetail] = useState({ label: '', value: '', type: 'Short Text' });
  const [showLogoField, setShowLogoField] = useState(false);

  const handleInputChange = (field, value) => {
    onUpdate({ ...form, [field]: value });
  };

  const addCustomDetail = () => {
    if (!newDetail.label.trim()) return;
    const updated = [...(form.customDetails || []), { ...newDetail }];
    onUpdate({ ...form, customDetails: updated });
    setNewDetail({ label: '', value: '', type: 'Short Text' });
  };

  const removeCustomDetail = (index) => {
    const updated = (form.customDetails || []).filter((_, i) => i !== index);
    onUpdate({ ...form, customDetails: updated });
  };

    
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6 text-slate-900">Step 1: Form / Event Details</h2>
        <p className="text-sm text-slate-600 mb-6">
          Add details about why the form exists. This becomes the landing / info page for participants.
        </p>

        {/* Main fields for template or scratch forms */}
        {!isScratch ? (
          <>
            {/* Template: all main fields */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Form Title / Event Name</label>
                <input type="text" value={form.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Workshop Registration" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Short Subtitle (optional)</label>
                <input type="text" value={form.subtitle || ''} onChange={(e) => handleInputChange('subtitle', e.target.value)} placeholder="e.g., 2024 Annual Workshop" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Description / Purpose</label>
              <textarea value={form.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Explain the purpose and details..." rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-900">Add Logo</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={showLogoField} onChange={(e) => setShowLogoField(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              {showLogoField && (
                <div>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { handleInputChange('logo', event.target?.result || ''); }; reader.readAsDataURL(file); } }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
                  {form.logo && (<div className="mt-3"><p className="text-xs text-slate-600 mb-2">Preview:</p><img src={form.logo} alt="Logo preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" /></div>)}
                </div>
              )}
            </div>
            {/* All original template fields */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Location / Mode</label>
              <input type="text" value={form.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="Online / Office / City, etc." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Date</label>
                <input type="date" value={form.date || ''} onChange={(e) => handleInputChange('date', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Time</label>
                <input type="time" value={form.time || ''} onChange={(e) => handleInputChange('time', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Organizer Name</label>
                <input type="text" value={form.organizerName || ''} onChange={(e) => handleInputChange('organizerName', e.target.value)} placeholder="e.g., John Smith" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Organizer Email</label>
                <input type="email" value={form.organizerEmail || ''} onChange={(e) => handleInputChange('organizerEmail', e.target.value)} placeholder="e.g., john@example.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Organizer Phone</label>
              <input type="tel" value={form.organizerPhone || ''} onChange={(e) => handleInputChange('organizerPhone', e.target.value)} placeholder="e.g., +1 (555) 123-4567" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </>
        ) : (
          <>
            {/* Scratch: only main fields (no location, date, time, organizer fields) */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Form Title / Event Name</label>
                <input type="text" value={form.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="e.g., Workshop Registration" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Short Subtitle (optional)</label>
                <input type="text" value={form.subtitle || ''} onChange={(e) => handleInputChange('subtitle', e.target.value)} placeholder="e.g., 2024 Annual Workshop" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Description / Purpose</label>
              <textarea value={form.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Explain the purpose and details..." rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-900">Add Logo</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={showLogoField} onChange={(e) => setShowLogoField(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              {showLogoField && (
                <div>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { handleInputChange('logo', event.target?.result || ''); }; reader.readAsDataURL(file); } }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
                  {form.logo && (<div className="mt-3"><p className="text-xs text-slate-600 mb-2">Preview:</p><img src={form.logo} alt="Logo preview" className="h-20 w-20 object-cover rounded-lg border border-slate-200" /></div>)}
                </div>
              )}
            </div>
          </>
        )}
        {/* Custom Details Section for both template and scratch forms */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Additional Details (custom)</h3>
          <p className="text-xs text-slate-500 mb-4">Add more structured details about the event/purpose (e.g., Speaker Name, Duration, Mode, Eligibility, Logo, etc.).</p>
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Detail Label</label>
                <input type="text" value={newDetail.label} onChange={(e) => setNewDetail({ ...newDetail, label: e.target.value })} placeholder="e.g., Speaker, Duration, Logo, Email" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Field Type</label>
                <div className="relative group">
                  <select value={newDetail.type} onChange={(e) => setNewDetail({ ...newDetail, type: e.target.value })} className="w-full appearance-none pr-10 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                    {fieldTypeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                  <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Value</label>
              {newDetail.type === 'Long Text' ? (
                <textarea value={newDetail.value} onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })} placeholder="e.g., Detailed info about the agenda, speakers, etc." rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ) : newDetail.type === 'Date' ? (
                <input type="date" value={newDetail.value} onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" style={{ colorScheme: 'light' }} />
              ) : newDetail.type === 'Time' ? (
                <input type="time" value={newDetail.value} onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" style={{ colorScheme: 'light' }} />
              ) : (
                <input type={newDetail.type === 'Email' ? 'email' : newDetail.type === 'Number' ? 'number' : 'text'} value={newDetail.value} onChange={(e) => setNewDetail({ ...newDetail, value: e.target.value })} placeholder={newDetail.type === 'Email' ? 'e.g., organizer@example.com' : newDetail.type === 'Number' ? 'e.g., 100, 50, 2, etc.' : 'e.g., Speaker lineup, 2 hours, Online, etc.'} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              )}
            </div>
          </div>
          <button onClick={addCustomDetail} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 mb-6">+ Add Detail</button>
          {form.customDetails && form.customDetails.length > 0 && (
            <div className="space-y-2">
              {form.customDetails.map((detail, idx) => (
                <div key={idx} className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{detail.label || 'Untitled detail'}</p>
                    <span className="text-xs text-slate-500">{detail.type || 'Short Text'}</span>
                  </div>
                  {detail.value && <p className="text-sm text-slate-600 whitespace-pre-wrap">{detail.value}</p>}
                  <div className="flex justify-end">
                    <button onClick={() => removeCustomDetail(idx)} className="text-red-600 hover:text-red-700 text-sm font-semibold">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}