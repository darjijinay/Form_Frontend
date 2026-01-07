"use client";
import { useState } from 'react';
import FormRenderer from '../forms/FormRenderer';

// Re-usable components from the public page, simplified for preview
const InfoCard = ({ icon, label, value }) => (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex items-start gap-4">
      <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl text-indigo-500 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-800 break-words">{value}</p>
      </div>
    </div>
  );
  
  const ItineraryDay = ({ day, description, index }) => (
    <div className="relative pl-7">
      <div className="absolute left-0 top-1 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-bold">
        {index}
      </div>
      <div className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100">
        <h4 className="font-semibold text-indigo-900 text-sm">{day}</h4>
        <p className="text-slate-700 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
  
  const ItineraryCard = ({ icon, label, value }) => {
    const days = (value || '').split(/(?=Day \d+:)/g).map(d => d.trim()).filter(Boolean);
    return (
      <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
            {icon}
          </div>
          <h3 className="text-base font-bold text-slate-800">{label}</h3>
        </div>
        <div className="space-y-3">
          {days.map((day, idx) => {
            const match = day.match(/^(Day \d+):\s*(.+)/i);
            if (match) return <ItineraryDay key={idx} day={match[1]} description={match[2]} index={idx + 1} />;
            return (
              <div key={idx} className="bg-white rounded-lg p-3 shadow-sm border border-indigo-100">
                <p className="text-slate-700 text-sm leading-relaxed">{day}</p>
              </div>
            );
          })}
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
    <div className="bg-slate-50 font-sans p-4 sm:p-6 lg:p-8">
        {form.headerImage && (
            <div className="rounded-lg overflow-hidden shadow-lg mb-6">
                <img src={getImageUrl(form.headerImage)} alt="Header" className="w-full h-auto max-h-60 object-cover" />
            </div>
        )}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="text-center">
                {form.logo && (
                    <div className="mb-4">
                        <img src={getImageUrl(form.logo)} alt="Logo" className="w-16 h-16 rounded-full mx-auto shadow-md border-2 border-white" />
                    </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{form.title || 'Form Title'}</h1>
                {form.subtitle && <p className="mt-2 text-md sm:text-lg text-slate-500 max-w-2xl mx-auto">{form.subtitle}</p>}
            </div>

            {(form.description || infoCards.length > 0) && <hr className="my-6 md:my-8 border-slate-200" />}

            {form.description && (
                <div className="mb-6 max-w-none text-slate-600">
                    <h2 className="text-lg font-bold text-slate-700 mb-2 text-center">About</h2>
                    <p className="whitespace-pre-wrap text-md leading-relaxed">{form.description}</p>
                </div>
            )}

            {infoCards.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {infoCards.map((card, idx) => card.label.toLowerCase().includes('itinerary')
                            ? <ItineraryCard key={idx} {...card} />
                            : <InfoCard key={idx} {...card} />
                        )}
                    </div>
                </div>
            )}

             {remainingCustomDetails.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-700 mb-3">Key Information</h2>
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