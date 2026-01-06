
"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { formApi } from '../../api/formApi';
import FormRenderer from '../../components/forms/FormRenderer';

// --- Helper Functions ---


const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http')) return path;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiBase.replace('/api', '');
  return `${baseUrl}${path}`;
};

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex items-start gap-4">
    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl text-indigo-500 flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="text-base font-bold text-slate-800 break-words">{value}</p>
    </div>
  </div>
);

const ItineraryDay = ({ day, description, index }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{day}: {description}</p>
    </div>
  );
  

  const ItineraryCard = ({ icon, label, value }) => {
    const days = (value || '').split('\n').map(d => d.trim()).filter(Boolean);
  
    return (
      <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-slate-800">{label}</h3>
        </div>
        <div className="space-y-4">
          {days.map((day, idx) => {
            const match = day.match(/^(Day \d+):\s*([\s\S]+)/i);
            if (match) {
              return <ItineraryDay key={idx} day={match[1]} description={match[2]} index={idx + 1} />;
            }
            return (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                <p className="text-slate-700 leading-relaxed">{day}</p>
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
  const usedCustomIndexes = new Set();
  
  const findCustomDetail = (matchFn) => {
    if (!Array.isArray(form.customDetails)) return null;
    for (let i = 0; i < form.customDetails.length; i++) {
      const d = form.customDetails[i];
      if (!d || !d.label || usedCustomIndexes.has(i)) continue;
      if (matchFn(String(d.label), d.value)) {
        usedCustomIndexes.add(i);
        return { value: d.value, label: d.label, index: i };
      }
    }
    return null;
  };

  const initialCards = [
    { key: 'date', label: 'Date', icon: '📅', value: form.date, match: (l) => /date/i.test(l) },
    { key: 'time', label: 'Time', icon: '⏰', value: form.time, match: (l) => /\btime\b/i.test(l) },
    { key: 'location', label: 'Location / Mode', icon: '📍', value: form.location, match: (l) => /location|place|venue|mode/i.test(l) },
    { key: 'salary', label: 'Salary', icon: '💰', value: form.salary, match: (l) => /salary|pay/i.test(l) },
    { key: 'employmentType', label: 'Employment Type', icon: '📄', value: form.employmentType, match: (l) => /employment type|job type/i.test(l) },
    { key: 'skills', label: 'Skills', icon: '✨', value: form.skills, match: (l) => /skill/i.test(l) },
    { key: 'deadline', label: 'Application Deadline', icon: '⏳', value: form.deadline, match: (l) => /deadline/i.test(l) },
    { key: 'eventStatus', label: 'Event Status', icon: '🗓️', value: form.eventStatus, match: (l) => /event status/i.test(l) },
    { key: 'capacity', label: 'Capacity', icon: '👥', value: form.capacity, match: (l) => /capacity/i.test(l) },
    { key: 'agenda', label: 'Agenda', icon: '📝', value: form.agenda, match: (l) => /agenda/i.test(l) },
    { key: 'destination', label: 'Destination', icon: '🌍', value: form.destination, match: (l) => /destination/i.test(l) },
    { key: 'duration', label: 'Duration', icon: '⏳', value: form.duration, match: (l) => /duration/i.test(l) },
    { key: 'price', label: 'Price', icon: '💰', value: form.price, match: (l) => /price/i.test(l) },
    { key: 'itinerary', label: 'Itinerary', icon: '🗺️', value: form.itinerary, match: (l) => /itinerary/i.test(l) },
    { key: 'organizerName', label: 'Organizer', icon: '👤', value: form.organizerName, match: (l) => /organizer name|host/i.test(l) },
    { key: 'organizerEmail', label: 'Organizer Email', icon: '✉️', value: form.organizerEmail, match: (l) => /organizer email|contact email/i.test(l) },
    { key: 'organizerPhone', label: 'Organizer Phone', icon: '📞', value: form.organizerPhone, match: (l) => /organizer phone|contact phone/i.test(l) }
  ].map(card => {
    const detail = card.value ? { value: card.value, label: getLabel(card.key, card.label) } : findCustomDetail(card.match);
    return detail ? { ...card, ...detail } : null;
  }).filter(Boolean);

  const uniqueMap = new Set();
  const infoCards = [];
  for (const card of initialCards) {
    const key = `${String(card.label).toLowerCase().trim()}|${String(card.value).trim()}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.add(key);
      infoCards.push(card);
    }
  }

  const remainingCustomDetails = Array.isArray(form.customDetails)
    ? form.customDetails.filter((_, idx) => !usedCustomIndexes.has(idx))
    : [];

  return { infoCards, remainingCustomDetails };
};

// --- Main Component ---

export default function PublicFormPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formInstanceKey, setFormInstanceKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    formApi.getPublicForm(id).then(res => setForm(res.data)).catch(() => {}).finally(() => setLoading(false));
    formApi.logView(id).catch(() => {});
  }, [id]);

  const handleSubmit = (payload) => {
    formApi.submitResponse(id, payload).then(() => setSubmitted(true)).catch(() => {});
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!form) return <div className="p-6">Form not found</div>;

  const { infoCards, remainingCustomDetails } = buildInfoCards(form);

  const landingPage = (
    <main className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {form.headerImage && (
          <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl mb-8">
            <img src={getImageUrl(form.headerImage)} alt="Header" className="w-full h-auto max-h-96 object-cover" />
          </div>
        )}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center">
            {form.logo && (
              <div className="mb-6">
                <img src={getImageUrl(form.logo)} alt="Logo" className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto shadow-lg border-4 border-white" />
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">{form.title}</h1>
            {form.subtitle && <p className="mt-3 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">{form.subtitle}</p>}
          </div>

          {(form.description || infoCards.length > 0) && <hr className="my-8 md:my-12 border-slate-200" />}

          {form.description && (
            <div className="mb-8 max-w-none text-slate-600">
              <h2 className="text-xl font-bold text-slate-700 mb-3 text-center">About</h2>
              <p className="whitespace-pre-wrap text-lg leading-relaxed">{form.description}</p>
            </div>
          )}

          {infoCards.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-700 mb-4">Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {infoCards.map((card, idx) => {
                  const isItinerary = card.label && card.label.toLowerCase().includes('itinerary');
                  if (isItinerary) {
                    return <ItineraryCard key={idx} {...card} />;
                  }
                  return <InfoCard key={idx} {...card} />;
                })}
              </div>
            </div>
          )}

          {remainingCustomDetails.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-700 mb-4">Key Information</h2>
              <div className="border border-slate-200 rounded-xl">
                {remainingCustomDetails.map((detail, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-4 ${idx > 0 ? 'border-t border-slate-200' : ''}`}>
                    <span className="font-semibold text-slate-600">{detail.label || 'Detail'}</span>
                    <span className="text-slate-500 text-right">{detail.value || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 text-center">
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 hover:-translate-y-0.5 transition-all transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register / Participate <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );

  const formView = (
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
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-800">{form.title}</h2>
              <p className="text-slate-500 mt-1">Please fill out the form below.</p>
            </div>
            <FormRenderer key={formInstanceKey} form={form} onSubmit={handleSubmit} />
          </div>
        )}
      </div>
    </main>
  );

  return showForm || submitted ? formView : landingPage;
}