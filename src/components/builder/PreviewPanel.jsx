"use client";
import { useState } from 'react';
import FormRenderer from '../forms/FormRenderer';

// Re-usable components from the public page, simplified for preview
const InfoCard = ({ icon, label, value }) => (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-between min-w-0">
      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-indigo-100 flex items-center justify-center text-sm sm:text-base text-indigo-500 flex-shrink-0">
          {icon}
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0">{label}</p>
      </div>
      <div className="flex-shrink-0 ml-9 sm:ml-0">
        <p className="text-xs sm:text-sm font-bold text-slate-800 text-right sm:text-right break-words">{value}</p>
      </div>
    </div>
  );
  
  const ItineraryCard = ({ icon, label, value }) => {
    return (
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg sm:rounded-xl p-3 sm:p-4 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0 mb-3">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-indigo-100 flex items-center justify-center text-sm sm:text-base text-indigo-500 flex-shrink-0">
            {icon}
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0">{label}</p>
        </div>
        <div className="ml-9 sm:ml-0">
          <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed whitespace-pre-wrap">{value}</p>
        </div>
      </div>
    );
  };
  
const buildInfoCards = (form) => {
    if (!form) return { infoCards: [], remainingCustomDetails: [] };
    const getLabel = (fieldKey, defaultLabel) => form.step1Labels?.[fieldKey] || defaultLabel;
    
    const allFields = [
      { key: 'date', defaultLabel: 'Date', icon: '📅' },
      { key: 'time', defaultLabel: 'Time', icon: '⏰' },
      { key: 'location', defaultLabel: 'Location / Mode', icon: '📍' },
      { key: 'salary', defaultLabel: 'Salary', icon: '💰' },
      { key: 'employmentType', defaultLabel: 'Employment Type', icon: '📄' },
      { key: 'skills', defaultLabel: 'Skills', icon: '✨' },
      { key: 'deadline', defaultLabel: 'Application Deadline', icon: '⏳' },
      { key: 'eventStatus', defaultLabel: 'Event Status', icon: '🗓️' },
      { key: 'capacity', defaultLabel: 'Capacity', icon: '👥' },
      { key: 'agenda', defaultLabel: 'Agenda', icon: '📝' },
      { key: 'destination', defaultLabel: 'Destination', icon: '🌍' },
      { key: 'duration', defaultLabel: 'Duration', icon: '⏳' },
      { key: 'price', defaultLabel: 'Price', icon: '💰' },
      { key: 'itinerary', defaultLabel: 'Itinerary', icon: '🗺️' },
      { key: 'organizerName', defaultLabel: 'Organizer', icon: '👤' },
      { key: 'organizerEmail', defaultLabel: 'Organizer Email', icon: '✉️' },
      { key: 'organizerPhone', defaultLabel: 'Organizer Phone', icon: '📞' }
    ];

    let infoCards = allFields
        .filter(field => form[field.key])
        .map(field => ({
            ...field,
            label: getLabel(field.key, field.defaultLabel),
            value: form[field.key]
        }));

    const remainingCustomDetails = form.customDetails?.filter(detail => 
        !infoCards.some(card => card.label.toLowerCase() === detail.label.toLowerCase())
    ) || [];

    return { infoCards, remainingCustomDetails };
};

const DEVICE_SIZES = {
  mobile: { width: '375px', label: 'Mobile', icon: '📱' },
  tablet: { width: '768px', label: 'Tablet', icon: '📱' },
  desktop: { width: '100%', label: 'Desktop', icon: '💻' },
};

export default function PreviewPanel({ form, isOpen, onClose }) {
  const [deviceType, setDeviceType] = useState('desktop');
  const [view, setView] = useState('landing'); // 'landing' or 'form'

  if (!isOpen) return null;

  const { infoCards, remainingCustomDetails } = buildInfoCards(form);
  const getImageUrl = (path) => (path && path.startsWith('data:')) ? path : null;

  const renderLandingPage = () => (
    <div className="bg-slate-50 font-sans p-4">
        {form.headerImage && (
            <div className="rounded-lg overflow-hidden shadow-lg mb-4">
                <img src={getImageUrl(form.headerImage)} alt="Header" className="w-full h-auto max-h-48 object-cover" />
            </div>
        )}
        <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6">
            <div className="text-center">
                {form.logo && (
                    <div className="mb-3">
                        <img src={getImageUrl(form.logo)} alt="Logo" className="w-14 h-14 rounded-full mx-auto shadow-md border-2 border-white" />
                    </div>
                )}
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{form.title || 'Form Title'}</h1>
                {form.subtitle && <p className="mt-1 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto">{form.subtitle}</p>}
            </div>

            {(form.description || infoCards.length > 0) && <hr className="my-5 sm:my-6 border-slate-200" />}

            {form.description && (
                <div className="mb-6 max-w-none text-slate-600">
                    <h2 className="text-base sm:text-lg font-bold text-slate-700 mb-2 text-center">About</h2>
                    <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{form.description}</p>
                </div>
            )}

            {infoCards.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-slate-700 mb-3">Details</h2>
                    <div className="space-y-2 sm:space-y-3">
                        {infoCards.map((card, idx) => card.label.toLowerCase().includes('itinerary')
                            ? <ItineraryCard key={idx} {...card} />
                            : <InfoCard key={idx} {...card} />
                        )}
                    </div>
                </div>
            )}

             {remainingCustomDetails.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-slate-700 mb-3">Key Information</h2>
                    <div className="border border-slate-200 rounded-xl">
                      {remainingCustomDetails.map((detail, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 ${idx > 0 ? 'border-t border-slate-200' : ''}`}>
                          <span className="font-semibold text-slate-600 text-sm">{detail.label || 'Detail'}</span>
                          <span className="text-slate-500 text-sm text-right">{detail.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                 </div>
              )}

            <div className="mt-8 text-center">
                <button
                    disabled
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold shadow-md cursor-not-allowed"
                >
                    Register / Participate
                </button>
            </div>
        </div>
    </div>
  );

  const renderForm = () => {
    // Determine send copy mode
    const sendCopyMode = typeof form.settings?.sendResponseCopy === 'string'
      ? form.settings.sendResponseCopy
      : (form.settings?.sendResponseCopy ? 'requested' : 'off');
    const showSendCopyCheckbox = (form.settings?.collectEmails === 'responder_input' || form.fields?.some(f => f.type === 'email')) && sendCopyMode === 'requested';

    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{form.title || 'Untitled Form'}</h1>
          {form.description && <p className="text-slate-600">{form.description}</p>}
        </div>
        <div className="space-y-4">
          {form.fields && form.fields.length > 0 ? (
            <FormRenderer form={form} isPreview={true} />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>No fields added yet. Add fields in Step 2 to see them here.</p>
            </div>
          )}
        </div>
        {showSendCopyCheckbox && (
          <div className="mt-6 mb-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="preview_send_copy_checkbox"
                disabled
                className="mt-1 w-4 h-4 cursor-not-allowed"
              />
              <label htmlFor="preview_send_copy_checkbox" className="text-sm text-slate-700 cursor-not-allowed">
                Send me a copy of my responses
              </label>
            </div>
          </div>
        )}
        {form.fields && form.fields.length > 0 && (
          <div className="mt-6">
            <button disabled className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium cursor-not-allowed opacity-75">
              Submit (Preview Mode)
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-800">Preview</h2>
              <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200">
                <button onClick={() => setView('landing')} className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'landing' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>Landing Page</button>
                <button onClick={() => setView('form')} className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'form' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 text-slate-600'}`}>Form Fields</button>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200">
                {Object.entries(DEVICE_SIZES).map(([key, {label, icon}]) => (
                  <button key={key} onClick={() => setDeviceType(key)} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${deviceType === key ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <span className="mr-1.5">{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200">×</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-200">
          <div
            style={{ width: DEVICE_SIZES[deviceType].width, maxWidth: '100%' }}
            className="mx-auto my-8 bg-white rounded-xl shadow-lg transition-all duration-300"
          >
            {view === 'landing' ? renderLandingPage() : renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
}