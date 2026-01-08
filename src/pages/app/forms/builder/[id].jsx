"use client";
import { useRouter } from 'next/router';
import AppLayout from '../../../../components/layout/AppLayout';
import FormBuilder from '../../../../components/builder/FormBuilder';
import PreviewPanel from '../../../../components/builder/PreviewPanel';
import Step1FormDetails from '../../../../components/builder/Step1FormDetails';
import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

// SSR-safe QR code image component
function QrImage({ publicUrl }) {
  const [qr, setQr] = useState('');
  useEffect(() => {
    if (!publicUrl) return;
    QRCode.toDataURL(publicUrl, { width: 128, margin: 2 }, (err, url) => {
      if (!err) setQr(url);
    });
  }, [publicUrl]);

  const handleDownload = () => {
    if (!qr) return;
    const a = document.createElement('a');
    a.href = qr;
    a.download = 'form-qr.png';
    a.click();
  };

  return (
    <div className="flex flex-col items-center">
      {qr && <img src={qr} alt="QR Code" width={96} height={96} style={{ background: '#fff', padding: 4, borderRadius: 8 }} />}
      <button
        className="mt-2 px-2 py-1 rounded bg-emerald-600 text-white text-xs"
        onClick={handleDownload}
      >
        Download QR
      </button>
      <div className="text-xs text-slate-400 mt-1">Share QR</div>
    </div>
  );
}
import { formApi } from '../../../../api/formApi';
import { useAuthStore } from '../../../../store/authStore';
import { TEMPLATE_LIBRARY } from '../../../../data/templates';

export default function FormBuilderPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState(null);
  const [step1VisibleFields, setStep1VisibleFields] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const statusTimer = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      let loadedForm;
      const templateId = router.query.templateId;

      if (id === 'new') {
        loadedForm = {
          title: 'Untitled form',
          description: '',
          fields: [],
          settings: { isPublic: true },
          step1Labels: {},
        };

        if (templateId) {
          const template = TEMPLATE_LIBRARY.find(t => t.id === templateId);
          if (template) {
            loadedForm = {
              ...loadedForm,
              ...template.formDetails,
              sourceTemplate: templateId,
              fields: template.fields,
              title: template.formDetails.title || 'Untitled form',
            };
          }
        }
      } else {
        try {
          const { data } = await formApi.getForm(id);
          loadedForm = {
            logo: data.logo || '',
            ...data,
          };
        } catch (error) {
          console.error('Error loading form:', error);
          return;
        }
      }
      setForm(loadedForm);

      const template = loadedForm.sourceTemplate ? TEMPLATE_LIBRARY.find(t => t.id === loadedForm.sourceTemplate) : null;
            const allPossibleOptionalFields = ['date', 'time', 'organizerEmail', 'organizerPhone', 'logo', 'headerImage', 'subtitle', 'organizerName', 'location', 'salary', 'skills', 'deadline', 'employmentType', 'eventStatus', 'capacity', 'agenda'];
      const visibility = {};

      if (template) {
        // Template defines visibility
        Object.assign(visibility, template.step1VisibleFields);
      } else {
        // No template, or new blank form: visibility is based on existing data
        allPossibleOptionalFields.forEach(field => {
          visibility[field] = !!loadedForm[field];
        });
      }
      
      setStep1VisibleFields(visibility);
    };

    load();
  }, [id, router.query]);

  // mark mounted
  useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);

  // autosave disabled: saving is manual via Save button

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setStatus('');
    try {
      if (id && id !== 'new') {
        const { data } = await formApi.updateForm(id, form);
        setForm(data);
      } else {
        const { data } = await formApi.createForm(form);
        // replace URL with new id so future saves update
        router.replace(`/app/forms/builder/${data._id}`);
        setForm(data);
      }
      setStatus('Form saved');
      // clear previous timer
      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setSaving(false);
    }
  };

  // shared save used by autosave and step navigation
  const doSave = async () => {
    if (!form) return false;
    if (saving) return false; // avoid concurrent saves
    setSaving(true);
    setStatus('Saving…');
    try {
      if (id && id !== 'new' && form._id) {
        const { data } = await formApi.updateForm(form._id || id, form);
        setForm(data);
      } else {
        const { data } = await formApi.createForm(form);
        router.replace(`/app/forms/builder/${data._id}`);
        setForm(data);
      }
      setStatus('Saved');
      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = setTimeout(() => setStatus(''), 2000);
      return true;
    } catch (e) {
      console.error('Autosave error', e);
      setStatus('Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, []);

  if (!form || !step1VisibleFields) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <p className="text-sm text-slate-600">Loading form...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center justify-end flex-shrink-0">
          {status && <span className="text-sm font-medium text-emerald-600">{status}</span>}
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <StepperItem index={1} label="Form Details" active={step===1} onClick={() => setStep(1)} />
          <div className="h-px bg-slate-200 flex-1" />
          <StepperItem index={2} label="Design Form" active={step===2} onClick={() => setStep(2)} />
          <div className="h-px bg-slate-200 flex-1" />
          <StepperItem index={3} label="Preview & Publish" active={step===3} onClick={() => setStep(3)} />
        </div>

        <div className="bg-white/90 border border-slate-200 rounded-2xl flex-1 min-h-0 overflow-hidden flex flex-col">
          {step === 1 && (
            <div className="overflow-y-auto p-6">
              <Step1FormDetails
                form={form}
                onUpdate={setForm}
                visibleFields={step1VisibleFields}
                onVisibleFieldsChange={setStep1VisibleFields}
                formTemplate={form.sourceTemplate}
              />
              
              <div className="mt-6 flex justify-between">
                <div />
                <div>
                  <button
                    onClick={async () => {
                      const errs = {};
                      if (!form.title || !form.title.trim()) errs.title = 'Title is required';
                      setErrors(errs);
                      if (Object.keys(errs).length > 0) return;
                      const ok = await doSave();
                      if (ok) setStep(2);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                  <h2 className="text-lg font-semibold">Step 2: Design Response Form</h2>
                  <p className="text-sm text-slate-600 mt-1">Define what information you want from participants. </p>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium flex items-center gap-2"
                >
                  <span>👁️</span>
                  Preview Form
                </button>
              </div>
              <div className="flex-1 min-h-0"><FormBuilder initialForm={form} onChange={setForm} /></div>
              <div className="mt-4 pt-4 border-t flex justify-between flex-shrink-0">
                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-xl border">← Back</button>
                <button
                  onClick={async () => {
                    const ok = await doSave();
                    if (ok) setStep(3);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (() => {
            const infoCards = [];
            const getLabel = (fieldKey, defaultLabel) => form.step1Labels?.[fieldKey] || defaultLabel;

            if (form.date) infoCards.push({ label: getLabel('date', 'Date'), value: form.date, icon: '📅' });
            if (form.time) infoCards.push({ label: getLabel('time', 'Time'), value: form.time, icon: '⏰' });
            if (form.location) infoCards.push({ label: getLabel('location', 'Location / Mode'), value: form.location, icon: '📍' });
            if (form.salary) infoCards.push({ label: getLabel('salary', 'Salary'), value: form.salary, icon: '💰' });
            if (form.employmentType) infoCards.push({ label: getLabel('employmentType', 'Employment Type'), value: form.employmentType, icon: '📄' });
            if (form.skills) infoCards.push({ label: getLabel('skills', 'Skills'), value: form.skills, icon: '✨' });
            if (form.deadline) infoCards.push({ label: getLabel('deadline', 'Application Deadline'), value: form.deadline, icon: '⏳' });
            if (form.organizerName) infoCards.push({ label: getLabel('organizerName', 'Organizer'), value: form.organizerName, icon: '👤' });
            if (form.organizerEmail) infoCards.push({ label: getLabel('organizerEmail', 'Organizer Email'), value: form.organizerEmail, icon: '✉️' });
            if (form.organizerPhone) infoCards.push({ label: getLabel('organizerPhone', 'Phone'), value: form.organizerPhone, icon: '📞' });
            if (form.destination) infoCards.push({ label: getLabel('destination', 'Destination'), value: form.destination, icon: '✈️' });
            if (form.duration) infoCards.push({ label: getLabel('duration', 'Duration'), value: form.duration, icon: '⏳' });
            if (form.price) infoCards.push({ label: getLabel('price', 'Price'), value: form.price, icon: '💰' });

            if (form.appointmentTitle) infoCards.push({ label: getLabel('appointmentTitle', 'Appointment Title'), value: form.appointmentTitle, icon: '🏷️' });
            if (form.appointmentDateTime && form.appointmentDateTime) infoCards.push({ label: getLabel('appointmentDateTime', 'Date & Time'), value: new Date(form.appointmentDateTime).toLocaleString(), icon: '🗓️' });
            if (form.appointmentLocation) infoCards.push({ label: getLabel('appointmentLocation', 'Location'), value: form.appointmentLocation, icon: '📍' });
            if (form.appointmentType) infoCards.push({ label: getLabel('appointmentType', 'Appointment Type'), value: form.appointmentType, icon: '📄' });

            const itineraryLines = form.itinerary ? form.itinerary.split('\n').filter(line => line.trim()) : [];

            return (
              <div className="overflow-y-auto p-6">
                <h2 className="text-lg font-semibold mb-2">Step 3: Preview & Publish</h2>
                <p className="text-sm text-slate-600 mb-4">This is how your form will look. </p>
                <div className="border rounded-xl p-4 mb-4 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl">{form.title || 'Form / Event Title'}</h3>
                      {form.subtitle && <p className="text-sm text-slate-500">{form.subtitle}</p>}
                    </div>
                    {form.logo && (
                      <div className="h-16 w-16 rounded-lg overflow-hidden ml-4 flex-shrink-0">
                        <img src={form.logo} alt="Logo" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                  
                  {form.description && (
                    <div className="mb-8 max-w-none text-slate-600">
                      <h4 className="text-md font-bold text-slate-700 mb-2">About</h4>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{form.description}</p>
                    </div>
                  )}

                  {form.appointmentDescription && (
                    <div className="mb-8 max-w-none">
                        <h4 className="text-md font-bold text-slate-700 mb-2">{form.step1Labels?.appointmentDescription || 'Appointment Description'}</h4>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{form.appointmentDescription}</p>
                    </div>
                  )}

                  {itineraryLines.length > 0 && (
                    <div className="mb-8 max-w-none">
                        <h4 className="text-md font-bold text-slate-700 mb-4">Itinerary</h4>
                        <div className="space-y-0">
                            {itineraryLines.map((line, index) => {
                                const parts = line.split(/:(.*)/s);
                                const title = parts[0].trim();
                                const description = parts[1] ? parts[1].trim() : '';
                                return (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                                                {index + 1}
                                            </div>
                                            {index < itineraryLines.length - 1 && (
                                                <div className="w-px flex-grow bg-slate-300 my-1"></div>
                                            )}
                                        </div>
                                        <div className="pb-4">
                                            <p className="font-bold text-sm text-slate-800">{title}</p>
                                            {description && <p className="text-slate-600 text-sm mt-1">{description}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                  )}

                  {infoCards.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-md font-bold text-slate-700 mb-4">Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {infoCards.map((card, idx) => (
                          <div key={idx} className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl text-indigo-500 flex-shrink-0">
                              {card.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                              <p className="text-sm font-bold text-slate-800 break-words">{card.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <button className="px-4 py-2 rounded-full bg-indigo-600 text-white">Register / Participate</button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Settings sections... */}
                </div>

                <div className="bg-slate-50 p-4 rounded mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">Share link</div>
                    <div className="text-xs text-slate-400">Copy to clipboard</div>
                  </div>
                  <div className="mt-2 flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 flex gap-2 w-full">
                      <input readOnly value={form._id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${form._id}` : ''} className="flex-1 px-3 py-2 border rounded" />
                      <button onClick={() => {
                        const url = form._id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${form._id}` : '';
                        if (!url) return;
                        navigator.clipboard?.writeText(url).then(()=> alert('Link copied'));
                      }} className="px-3 py-2 rounded bg-indigo-600 text-white">Copy</button>
                    </div>
                    {form._id && <QrImage publicUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/public/${form._id}`} />}
                  </div>

                  <div className="mt-2 text-xs text-slate-500">Public URL: <code className="break-all">{form._id ? `${typeof window !== 'undefined' ? window.location.origin : ''}/public/${form._id}` : '-'}</code></div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep(2)} className="px-4 py-2 rounded-xl border">← Back</button>
                  <button 
                    onClick={async () => {
                      setSaving(true);
                      setStatus('Saving…');
                      try {
                        const { data } = await formApi.updateForm(form._id, form);
                        setForm(data);
                        setStatus('Form saved ✓');
                        setTimeout(() => setStatus(''), 2000);
                      } catch (error) {
                        console.error('Error saving form:', error);
                        setStatus('Error saving form');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Preview Panel */}
      <PreviewPanel
        form={form}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </AppLayout>
  );
}

function StepButton({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-full text-sm ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
      {children}
    </button>
  );
}

function StepperItem({ index, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${active ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
        {index}
      </div>
      <div className={`text-sm ${active ? 'text-[var(--text)] font-medium' : 'text-slate-500'}`}>{label}</div>
    </button>
  );
}