"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { formApi } from '../../api/formApi';
import FormRenderer from '../../components/forms/FormRenderer';

export default function PublicFormPage(){
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formInstanceKey, setFormInstanceKey] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [sendCopy, setSendCopy] = useState(false);
  const [sendCopyMode, setSendCopyMode] = useState('off');

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('data:')) return path; // Base64 encoded image
    if (path.startsWith('http')) return path; // Already full URL
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiBase.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  useEffect(()=>{
    if(!id) return;
    setLoading(true);
    formApi.getPublicForm(id).then(res=>setForm(res.data)).catch(()=>{}).finally(()=>setLoading(false));
    // record view once per mount
    formApi.logView(id).catch(()=>{});
  },[id]);

  useEffect(() => {
    if (!form) return;
    const mode = typeof form.settings?.sendResponseCopy === 'string'
      ? form.settings.sendResponseCopy
      : (form.settings?.sendResponseCopy ? 'requested' : 'off');
    setSendCopyMode(mode);
    setSendCopy(mode === 'always');
  }, [form]);

  const handleSubmit = (payload) => {
    setSubmitError('');
    const payloadWithCopy = { answers: payload, sendCopy: sendCopyMode === 'always' ? true : sendCopy };
    formApi.submitResponse(id, payloadWithCopy)
      .then(() => setSubmitted(true))
      .catch((error) => {
        const message = error.response?.data?.message || 'Failed to submit form. Please try again.';
        setSubmitError(message);
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  if(loading) return <div className="p-6">Loading...</div>;
  if(!form) return <div className="p-6">Form not found</div>;

  // Landing page view (event details)
  if(!showForm && !submitted) {
    // ... (logic for info cards, etc. remains the same)
    const usedCustomIndexes = new Set();
    const initialInfoCards = [];
    const getLabel = (fieldKey, defaultLabel) => form.step1Labels?.[fieldKey] || defaultLabel;

    const findCustomDetail = (predicate) => {
        if (!Array.isArray(form.customDetails)) {
            return null;
        }
        const detail = form.customDetails.find(d => d && predicate(d.label));
        if (!detail) {
            return null;
        }
        // Mark as used
        const detailIndex = form.customDetails.findIndex(d => d && predicate(d.label));
        if (detailIndex !== -1) {
            usedCustomIndexes.add(detailIndex);
        }
        return detail;
    };

    // Only add PREDEFINED FORM FIELDS to Details section, never look in custom details
    const dateDetail = form.date ? { value: form.date, label: getLabel('date', 'Date') } : null;
    if (dateDetail) initialInfoCards.push({ label: dateDetail.label, value: dateDetail.value, icon: '📅' });

    const startDetail = form.startTime ? { value: form.startTime, label: getLabel('startTime', 'Start Time') } : null;
    const endDetail = form.endTime ? { value: form.endTime, label: getLabel('endTime', 'End Time') } : null;
    if (!startDetail && !endDetail) {
      const timeDetail = form.time ? { value: form.time, label: getLabel('time', 'Time') } : null;
      if (timeDetail) initialInfoCards.push({ label: timeDetail.label, value: timeDetail.value, icon: '⏰' });
    } else {
      if (startDetail) initialInfoCards.push({ label: startDetail.label, value: startDetail.value, icon: '⏰' });
      if (endDetail) initialInfoCards.push({ label: endDetail.label, value: endDetail.value, icon: '⏰' });
    }

    const locationDetail = form.location ? { value: form.location, label: getLabel('location', 'Location / Mode') } : null;
    if (locationDetail) initialInfoCards.push({ label: locationDetail.label, value: locationDetail.value, icon: '📍' });

    const salaryDetail = form.salary ? { value: form.salary, label: getLabel('salary', 'Salary') } : null;
    if (salaryDetail) initialInfoCards.push({ label: salaryDetail.label, value: salaryDetail.value, icon: '💰' });

    const employmentTypeDetail = form.employmentType ? { value: form.employmentType, label: getLabel('employmentType', 'Employment Type') } : null;
    if (employmentTypeDetail) initialInfoCards.push({ label: employmentTypeDetail.label, value: employmentTypeDetail.value, icon: '📄' });

    const skillsDetail = form.skills ? { value: form.skills, label: getLabel('skills', 'Skills') } : null;
    if (skillsDetail) initialInfoCards.push({ label: skillsDetail.label, value: skillsDetail.value, icon: '✨' });

    const deadlineDetail = form.deadline ? { value: form.deadline, label: getLabel('deadline', 'Application Deadline') } : null;
    if (deadlineDetail) initialInfoCards.push({ label: deadlineDetail.label, value: deadlineDetail.value, icon: '⏳' });

    const itineraryDetail = form.itinerary ? { value: form.itinerary, label: getLabel('itinerary', 'Itinerary') } : null;
    if (itineraryDetail) initialInfoCards.push({ label: itineraryDetail.label, value: itineraryDetail.value, icon: '📋' });

    const organizerNameDetail = form.organizerName ? { value: form.organizerName, label: getLabel('organizerName', 'Organizer') } : null;
    if (organizerNameDetail) initialInfoCards.push({ label: organizerNameDetail.label, value: organizerNameDetail.value, icon: '👤' });

    const organizerEmailLabel = form.sourceTemplate === 'tpl2' ? getLabel('organizerEmail', 'E-mail') : getLabel('organizerEmail', 'Organizer Email');
    const organizerEmailDetail = form.organizerEmail ? { value: form.organizerEmail, label: organizerEmailLabel } : null;
    if (organizerEmailDetail) initialInfoCards.push({ label: organizerEmailDetail.label || organizerEmailLabel, value: organizerEmailDetail.value, icon: '✉️' });

    const organizerPhoneLabel = form.sourceTemplate === 'tpl2' ? getLabel('organizerPhone', 'Phone No') : getLabel('organizerPhone', 'Phone');
    const organizerPhoneDetail = form.organizerPhone ? { value: form.organizerPhone, label: organizerPhoneLabel } : null;
    if (organizerPhoneDetail) initialInfoCards.push({ label: organizerPhoneDetail.label || organizerPhoneLabel, value: organizerPhoneDetail.value, icon: '📞' });

    const destinationDetail = form.destination ? { value: form.destination, label: getLabel('destination', 'Destination') } : findCustomDetail((label) => /destination/i.test(label));
    if (destinationDetail) initialInfoCards.push({ label: destinationDetail.label, value: destinationDetail.value, icon: '✈️' });

    const durationDetail = form.duration ? { value: form.duration, label: getLabel('duration', 'Duration') } : findCustomDetail((label) => /duration/i.test(label));
    if (durationDetail) initialInfoCards.push({ label: durationDetail.label, value: durationDetail.value, icon: '⏳' });

    const priceDetail = form.price ? { value: form.price, label: getLabel('price', 'Price') } : findCustomDetail((label) => /price/i.test(label));
    if (priceDetail) initialInfoCards.push({ label: priceDetail.label, value: priceDetail.value, icon: '💰' });

    const appointmentTitleDetail = form.appointmentTitle ? { value: form.appointmentTitle, label: getLabel('appointmentTitle', 'Appointment Title') } : findCustomDetail((label) => /appointment title/i.test(label));
    if (appointmentTitleDetail) initialInfoCards.push({ label: appointmentTitleDetail.label, value: appointmentTitleDetail.value, icon: '🏷️' });

    const appointmentDateTimeDetail = form.appointmentDateTime ? { value: form.appointmentDateTime, label: getLabel('appointmentDateTime', 'Date & Time') } : findCustomDetail((label) => /appointment date|appointment time/i.test(label));
    if (appointmentDateTimeDetail && appointmentDateTimeDetail.value) initialInfoCards.push({ label: appointmentDateTimeDetail.label, value: new Date(appointmentDateTimeDetail.value).toLocaleString(), icon: '🗓️' });

    const appointmentLocationDetail = form.appointmentLocation ? { value: form.appointmentLocation, label: getLabel('appointmentLocation', 'Location') } : findCustomDetail((label) => /appointment location/i.test(label));
    if (appointmentLocationDetail) initialInfoCards.push({ label: appointmentLocationDetail.label, value: appointmentLocationDetail.value, icon: '📍' });

    const appointmentTypeDetail = form.appointmentType ? { value: form.appointmentType, label: getLabel('appointmentType', 'Appointment Type') } : findCustomDetail((label) => /appointment type/i.test(label));
    if (appointmentTypeDetail) initialInfoCards.push({ label: appointmentTypeDetail.label, value: appointmentTypeDetail.value, icon: '📄' });

    const organizerNameVal = organizerNameDetail ? organizerNameDetail.value : (form.organizerName || null);
    const organizerEmailVal = organizerEmailDetail ? organizerEmailDetail.value : (form.organizerEmail || null);
    const organizerPhoneVal = organizerPhoneDetail ? organizerPhoneDetail.value : (form.organizerPhone || null);

    const uniqueMap = new Set();
    const infoCards = [];
    for (const card of initialInfoCards) {
      const key = `${String(card.label).toLowerCase().trim()}|${String(card.value).trim()}`;
      if (uniqueMap.has(key)) continue;
      uniqueMap.add(key);
      if (Array.isArray(form.customDetails)) {
        for (let i = 0; i < form.customDetails.length; i++) {
          const d = form.customDetails[i];
          if (!d) continue;
          try {
            if (String(d.label).toLowerCase().trim() === String(card.label).toLowerCase().trim()) {
              usedCustomIndexes.add(i);
            }
          } catch (e) {}
        }
      }
      infoCards.push(card);
    }

    const remainingCustomDetails = Array.isArray(form.customDetails) ? form.customDetails.filter((_, idx) => !usedCustomIndexes.has(idx)) : [];
    const itineraryLines = form.itinerary ? form.itinerary.split('\n').filter(line => line.trim()) : [];

    return (
        <main className="min-h-screen bg-slate-50 font-sans">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header Image */}
            {form.headerImage && (
              <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mb-8">
                <img src={getImageUrl(form.headerImage)} alt="Header" className="w-full h-auto max-h-96 object-cover" />
              </div>
            )}
  
            {/* Content Container */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-8 md:p-12">
              <div className="text-center">
                {/* Logo */}
                {form.logo && (
                  <div className="mb-6">
                    <img src={getImageUrl(form.logo)} alt="Logo" className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto shadow-lg border-4 border-white" />
                  </div>
                )}
  
                {/* Title and Subtitle */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">{form.title}</h1>
                {form.subtitle && <p className="mt-3 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">{form.subtitle}</p>}
              </div>
  
              {/* Divider */}
              {(form.description || infoCards.length > 0) && <hr className="my-8 md:my-12 border-slate-200" />}
  
              {/* Description */}
              {form.description && (
                <div className="mb-8 max-w-none text-slate-600">
                  <h2 className="text-xl font-bold text-slate-700 mb-3 text-center">About</h2>
                  <p className="whitespace-pre-wrap text-lg leading-relaxed">{form.description}</p>
                </div>
              )}

              {form.appointmentDescription && (
                <div className="mb-8 max-w-none">
                    <h2 className="text-xl font-bold text-slate-700 mb-3 text-center">{form.step1Labels?.appointmentDescription || 'Appointment Description'}</h2>
                    <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-600">{form.appointmentDescription}</p>
                </div>
              )}
  
              {/* Itinerary */}
              {itineraryLines.length > 0 && (
                <div className="mb-8 max-w-none">
                    <h2 className="text-xl font-bold text-slate-700 mb-6 text-center">Itinerary</h2>
                    <div className="space-y-0">
                        {itineraryLines.map((line, index) => {
                            const parts = line.split(/:(.*)/s);
                            const title = parts[0].trim();
                            const description = parts[1] ? parts[1].trim() : '';
                            return (
                                <div key={index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                                            {index + 1}
                                        </div>
                                        {index < itineraryLines.length - 1 && (
                                            <div className="w-px flex-grow bg-slate-300 my-2"></div>
                                        )}
                                    </div>
                                    <div className="pb-8">
                                        <p className="font-bold text-slate-800">{title}</p>
                                        {description && <p className="text-slate-600 mt-1">{description}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
              )}
  
              {/* Info Cards - only standard fields */}
              {infoCards.length > 0 && (
                <div className="mb-12">
                   <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Details</h2>
                  <div className="space-y-2 sm:space-y-3 overflow-x-auto">
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-full`}>
                      {infoCards.map((card, idx) => {
                        const isLastAndOdd = idx === infoCards.length - 1 && infoCards.length % 2 === 1;
                        const isMultiLine = card.value && card.value.includes('\n');
                        if (isLastAndOdd) return null;
                        
                        // Multi-line or itinerary: vertical layout
                        if (isMultiLine || card.label.toLowerCase().includes('itinerary')) {
                          return (
                            <div 
                              key={idx} 
                              className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                                  {card.icon}
                                </div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                              </div>
                              <div className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-pre-wrap leading-relaxed">
                                {card.value}
                              </div>
                            </div>
                          );
                        }
                        
                        // Single-line: horizontal layout
                        return (
                          <div 
                            key={idx} 
                            className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                                {card.icon}
                              </div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{card.label}</p>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 text-right whitespace-nowrap">
                                {card.value}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {infoCards.length % 2 === 1 && (
                      <div className="flex justify-center">
                        {infoCards.map((card, idx) => {
                          const isLastAndOdd = idx === infoCards.length - 1 && infoCards.length % 2 === 1;
                          const isMultiLine = card.value && card.value.includes('\n');
                          if (!isLastAndOdd) return null;
                          
                          // Multi-line or itinerary: vertical layout
                          if (isMultiLine || card.label.toLowerCase().includes('itinerary')) {
                            return (
                              <div 
                                key={idx} 
                                className="w-full sm:w-1/2 bg-white border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                              >
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                                    {card.icon}
                                  </div>
                                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                                </div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-pre-wrap leading-relaxed">
                                  {card.value}
                                </div>
                              </div>
                            );
                          }
                          
                          // Single-line: horizontal layout
                          return (
                            <div 
                              key={idx} 
                              className="w-full sm:w-1/2 bg-white border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
                                  {card.icon}
                                </div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{card.label}</p>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <p className="text-xs sm:text-sm font-semibold text-slate-900 text-right whitespace-nowrap">
                                  {card.value}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
  
              
              {/* All Custom Details in Key Information */}
              {Array.isArray(form.customDetails) && form.customDetails.length > 0 && (
                 <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-700 mb-4">Key Information</h2>
                    <div className="border border-slate-200 rounded-xl">
                      {remainingCustomDetails.map((detail, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-4 ${idx > 0 ? 'border-t border-slate-200' : ''}`}>
                          <span className="font-semibold text-slate-600">{detail?.label || 'Detail'}</span>
                          <span className="text-slate-500 text-right whitespace-pre-wrap">{detail?.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                 </div>
              )}
  
              {/* Action Button */}
              <div className="mt-10 text-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register / Participate
                  <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      );
  }

  // Form submission view
  return (
     <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        {submitted ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 mt-12 text-center">
             <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Thank You!</h2>
            <p className="text-slate-600 mb-8">Your response has been recorded.</p>
            <div className="space-y-4">
               <button
                onClick={() => {
                  setSubmitted(false);
                  setShowForm(true);
                  setFormInstanceKey(k => k + 1);
                  const mode = typeof form.settings?.sendResponseCopy === 'string'
                    ? form.settings.sendResponseCopy
                    : (form.settings?.sendResponseCopy ? 'requested' : 'off');
                  setSendCopyMode(mode);
                  setSendCopy(mode === 'always');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-indigo-600 hover:underline font-medium"
              >
                Submit another response
              </button>
              <div>
                <button
                  onClick={() => { setSubmitted(false); setShowForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-sm text-slate-500 hover:underline"
                >
                  ← Back to landing page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
            <button
              onClick={() => setShowForm(false)}
              className="mb-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              ← Back to Details
            </button>
            
            {/* Error message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <span className="text-red-600 text-xl">✕</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">Submission failed</p>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            )}
            
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-800">{form.title}</h2>
              <p className="text-slate-500 mt-1">Please fill out the form below.</p>
            </div>

            {(form.settings?.collectEmails === 'responder_input' || form.fields?.some(f => f.type === 'email')) && sendCopyMode === 'requested' && (
              <div className="mb-6">
                <div className="mt-2 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="send_copy_checkbox"
                    checked={sendCopy}
                    onChange={(e) => setSendCopy(e.target.checked)}
                    className="mt-1 w-4 h-4"
                  />
                  <label htmlFor="send_copy_checkbox" className="text-sm text-slate-700 cursor-pointer">
                    Send me a copy of my responses
                  </label>
                </div>
              </div>
            )}
            
            {(form.settings?.collectEmails === 'responder_input' || form.fields?.some(f => f.type === 'email')) && sendCopyMode === 'always' && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-lg">ℹ️</span>
                  <p className="text-sm text-blue-800">
                    A copy of your responses will be emailed to the address you provided.
                  </p>
                </div>
              </div>
            )}
            
            <FormRenderer key={formInstanceKey} form={form} onSubmit={handleSubmit} />
          </div>
        )}
      </div>
    </main>
  );
}
