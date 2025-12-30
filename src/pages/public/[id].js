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

  const handleSubmit = (payload) => {
    formApi.submitResponse(id, payload).then(()=> setSubmitted(true)).catch(()=>{});
  };

  if(loading) return <div className="p-6">Loading...</div>;
  if(!form) return <div className="p-6">Form not found</div>;

  // Landing page view (event details)
  if(!showForm && !submitted) {
    // Build info cards from top-level fields, or fall back to matching customDetails
    const usedCustomIndexes = new Set();
    const findCustomDetail = (matchFn) => {
      if (!Array.isArray(form.customDetails)) return null;
      for (let i = 0; i < form.customDetails.length; i++) {
        const d = form.customDetails[i];
        if (!d || !d.label) continue;
        if (matchFn(String(d.label), d.value)) {
          usedCustomIndexes.add(i);
          return { value: d.value, label: d.label, index: i };
        }
      }
      return null;
    };

    const initialInfoCards = [];
    const getLabel = (fieldKey, defaultLabel) => {
      return form.step1Labels?.[fieldKey] || defaultLabel;
    }

    const dateDetail = form.date ? { value: form.date, label: getLabel('date', 'Date') } : findCustomDetail((label) => /date/i.test(label));
    if (dateDetail) initialInfoCards.push({ label: dateDetail.label, value: dateDetail.value, icon: '📅' });

    // Find start/end times by user-provided labels; fall back to generic time
    const startDetail = form.startTime ? { value: form.startTime, label: getLabel('startTime', 'Start Time') } : findCustomDetail((label) => /start time|start|begin/i.test(label));
    const endDetail = form.endTime ? { value: form.endTime, label: getLabel('endTime', 'End Time') } : findCustomDetail((label) => /end time|end|finish|closing/i.test(label));
    if (!startDetail && !endDetail) {
      const timeDetail = form.time ? { value: form.time, label: getLabel('time', 'Time') } : findCustomDetail((label) => /\btime\b/i.test(label));
      if (timeDetail) initialInfoCards.push({ label: timeDetail.label, value: timeDetail.value, icon: '⏰' });
    } else {
      if (startDetail) initialInfoCards.push({ label: startDetail.label, value: startDetail.value, icon: '⏰' });
      if (endDetail) initialInfoCards.push({ label: endDetail.label, value: endDetail.value, icon: '⏰' });
    }

    const locationDetail = form.location ? { value: form.location, label: getLabel('location', 'Location / Mode') } : findCustomDetail((label) => /location|place|venue|mode/i.test(label));
    if (locationDetail) initialInfoCards.push({ label: locationDetail.label, value: locationDetail.value, icon: '📍' });

    const salaryDetail = form.salary ? { value: form.salary, label: getLabel('salary', 'Salary') } : findCustomDetail((label) => /salary|pay/i.test(label));
    if (salaryDetail) initialInfoCards.push({ label: salaryDetail.label, value: salaryDetail.value, icon: '💰' });

    const employmentTypeDetail = form.employmentType ? { value: form.employmentType, label: getLabel('employmentType', 'Employment Type') } : findCustomDetail((label) => /employment type|job type|employment/i.test(label));
    if (employmentTypeDetail) initialInfoCards.push({ label: employmentTypeDetail.label, value: employmentTypeDetail.value, icon: '📄' });

    const skillsDetail = form.skills ? { value: form.skills, label: getLabel('skills', 'Skills') } : findCustomDetail((label) => /skill/i.test(label));
    if (skillsDetail) initialInfoCards.push({ label: skillsDetail.label, value: skillsDetail.value, icon: '✨' });

    const deadlineDetail = form.deadline ? { value: form.deadline, label: getLabel('deadline', 'Application Deadline') } : findCustomDetail((label) => /deadline/i.test(label));
    if (deadlineDetail) initialInfoCards.push({ label: deadlineDetail.label, value: deadlineDetail.value, icon: '⏳' });

    // Match organizer name/email/phone with more specific rules so we don't pick an email for the name
    const organizerNameDetail = form.organizerName ? { value: form.organizerName, label: getLabel('organizerName', 'Organizer') } : findCustomDetail((label) => {
      const l = String(label).toLowerCase();
      if (/organizer name|organiser name|organizername|organisername/.test(l)) return true;
      if (/\borganizer\b|\borganiser\b|\bhost\b|\bby\b/.test(l) && !/email|phone|mobile|contact/.test(l)) return true;
      return false;
    });
    if (organizerNameDetail) initialInfoCards.push({ label: organizerNameDetail.label, value: organizerNameDetail.value, icon: '👤' });

    const organizerEmailLabel = form.sourceTemplate === 'tpl2' ? getLabel('organizerEmail', 'E-mail') : getLabel('organizerEmail', 'Organizer Email');
    const organizerEmailDetail = form.organizerEmail ? { value: form.organizerEmail, label: organizerEmailLabel } : findCustomDetail((label) => /organizer email|organizeremail|contact email|email|e-mail/i.test(String(label).toLowerCase()));
    if (organizerEmailDetail) initialInfoCards.push({ label: organizerEmailDetail.label || organizerEmailLabel, value: organizerEmailDetail.value, icon: '✉️' });

    const organizerPhoneLabel = form.sourceTemplate === 'tpl2' ? getLabel('organizerPhone', 'Phone No') : getLabel('organizerPhone', 'Phone');
    const organizerPhoneDetail = form.organizerPhone ? { value: form.organizerPhone, label: organizerPhoneLabel } : findCustomDetail((label) => /organizer phone|phone|mobile|contact phone|phone number|tel|telephone/i.test(String(label).toLowerCase()));
    if (organizerPhoneDetail) initialInfoCards.push({ label: organizerPhoneDetail.label || organizerPhoneLabel, value: organizerPhoneDetail.value, icon: '📞' });

    // expose simple value variables for later blocks (contact box, etc.)
    const organizerNameVal = organizerNameDetail ? organizerNameDetail.value : (form.organizerName || null);
    const organizerEmailVal = organizerEmailDetail ? organizerEmailDetail.value : (form.organizerEmail || null);
    const organizerPhoneVal = organizerPhoneDetail ? organizerPhoneDetail.value : (form.organizerPhone || null);

    // Deduplicate infoCards (label+value) and make sure any matched customDetails indexes
    // are recorded in usedCustomIndexes so they are excluded from Key Information.
    const uniqueMap = new Set();
    const infoCards = [];
    for (const card of initialInfoCards) {
      const key = `${String(card.label).toLowerCase().trim()}|${String(card.value).trim()}`;
      if (uniqueMap.has(key)) continue;
      uniqueMap.add(key);
      // mark any customDetails entries that match this card's value (to exclude later)
      if (Array.isArray(form.customDetails)) {
        for (let i = 0; i < form.customDetails.length; i++) {
          const d = form.customDetails[i];
          if (!d) continue;
          try {
            if (String(d.value).trim() === String(card.value).trim() || String(d.label).toLowerCase().trim() === String(card.label).toLowerCase().trim()) {
              usedCustomIndexes.add(i);
            }
          } catch (e) {}
        }
      }
      infoCards.push(card);
    }

    // Build remaining custom details excluding those we pulled out
    const remainingCustomDetails = Array.isArray(form.customDetails)
      ? form.customDetails.filter((_, idx) => !usedCustomIndexes.has(idx))
      : [];

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 px-6 sm:px-10 py-10 sm:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                    Open for Registration
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {form.title}
                  </h1>
                  {form.subtitle && (
                    <p className="text-lg sm:text-xl text-indigo-50 font-medium">
                      {form.subtitle}
                    </p>
                  )}
                </div>

                {form.logo && (
                  <div className="flex-shrink-0">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={getImageUrl(form.logo)} 
                        alt="Logo" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 sm:px-10 py-8 sm:py-10 space-y-8">
              {/* Description */}
              {form.description && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    About This Event
                  </h2>
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    {form.description}
                  </p>
                </div>
              )}

              {/* Info Cards */}
              {infoCards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {infoCards.map((card, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-5 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                          {card.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                            {card.label}
                          </p>
                          <p className="text-lg font-bold text-slate-900 break-words">
                            {card.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {remainingCustomDetails.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border-2 border-indigo-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    Key Information
                  </h3>
                  <div className="space-y-3">
                    {remainingCustomDetails.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-4 py-3 border-b border-indigo-100 last:border-0"
                      >
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          <span>{detail.label || 'Detail'}</span>
                        </div>
                        <div className="text-slate-700 text-sm text-right break-words max-w-xs font-medium">
                          {detail.value || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(organizerEmailVal || organizerPhoneVal) && (
                <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Questions? We can help.</p>
                    <p className="text-sm text-slate-700">Reach out and we'll respond promptly.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {organizerEmailVal && (
                      <a href={`mailto:${organizerEmailVal}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-slate-900 hover:bg-white/15 transition">
                        <span className="text-xs font-semibold">Email</span>
                        <span className="font-semibold">{organizerEmailVal}</span>
                      </a>
                    )}
                    {organizerPhoneVal && (
                      <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-slate-900">
                        <span className="text-xs font-semibold">Phone</span>
                        <span className="font-semibold">{organizerPhoneVal}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Limited seats · Secure your spot now
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-lg shadow-indigo-900/50 hover:translate-y-px transition"
                >
                  Register / Participate
                  <span aria-hidden>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Form submission view
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-3xl mx-auto">
        {submitted ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 p-12 mt-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Thank You!</h2>
            <p className="text-slate-700 text-center mb-8">Your response has been recorded.</p>
            <div className="text-center space-y-3">
              <button
                onClick={() => {
                  // Open a fresh form instance without navigating away
                  setSubmitted(false);
                  setShowForm(true);
                  setFormInstanceKey(k => k + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium underline text-sm"
              >
                Submit another response
              </button>
              <div>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setShowForm(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-slate-800 underline"
                >
                  ← Back to landing page
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 p-8 md:p-10">
            <button
              onClick={() => setShowForm(false)}
              className="mb-6 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition-colors"
            >
              ← Back to Event Details
            </button>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{form.title}</h2>
              <p className="text-slate-600">Registration Form</p>
            </div>
            <FormRenderer key={formInstanceKey} form={form} onSubmit={handleSubmit} />
          </div>
        )}
      </div>
    </main>
  );
}