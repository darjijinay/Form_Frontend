import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import TemplateModal from '../../components/templates/TemplateModal';
import { useRouter } from 'next/router';
import { formApi } from "../../api/formApi";
import { templateApi } from "../../api/templateApi";

const FALLBACK_TEMPLATES = [
  { id: "tpl1", title: "Workshop Registration", description: "Collect attendee details for your upcoming workshop or seminar.", category: "Events" },
  { id: "tpl2", title: "Job Application", description: "Standard job application form with resume upload section.", category: "HR" },
  { id: "tpl3", title: "Customer Feedback", description: "Gather insights from your customers about your product.", category: "Feedback" },
  { id: "tpl4", title: "College Admission", description: "Comprehensive form for student admission inquiries.", category: "Education" },
  { id: "tpl5", title: "Event RSVP", description: "Simple RSVP form for parties, weddings, and corporate events.", category: "Events" },
  { id: "tpl6", title: "Contact Us", description: "Basic contact form for your website visitors.", category: "General" },
  { id: "tpl7", title: "Quick Survey", description: "Simple multi-choice survey template.", category: "Survey" },
  { id: "tpl8", title: "Product Template", description: "Product order form with customer and product details.", category: "Product" },
  { id: "tpl9", title: "Course Template", description: "Collect course enrollment details from students.", category: "Education" },
  { id: "tpl10", title: "Trip Package Template", description: "Capture trip package details and traveler info.", category: "Travel" },
  { id: "tpl11", title: "Appointment Booking Template", description: "Book appointments with preferred service and time slot.", category: "Appointment" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
  const [loading, setLoading] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);
  const router = useRouter();

  const handleUseTemplate = (tpl) => {
    router.push(`/app/forms/builder/new?templateId=${tpl.id}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Templates</h1>
            <p className="text-sm sm:text-base text-slate-600">Start with a pre-built template to save time.</p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => {
            const id = t.id;
            const isSelected = selectedTemplateId === id;
            const category = (t.category || 'General').toLowerCase();

            const colorMap = {
              events: 'bg-rose-400',
              hr: 'bg-emerald-400',
              feedback: 'bg-violet-400',
              survey: 'bg-purple-400',
              education: 'bg-orange-400',
              general: 'bg-sky-400',
              product: 'bg-amber-400',
              travel: 'bg-teal-400',
              appointment: 'bg-indigo-400',
            };

            const stripeClass = colorMap[category] || 'bg-sky-400';

            return (
              <div
                key={id}
                onClick={() => setSelectedTemplateId(id)}
                className={`relative rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between h-full overflow-hidden shadow-sm hover:shadow-md ${
                  isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {/* colored top stripe */}
                <div className={`${stripeClass} h-1 w-full`} />

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs uppercase text-slate-500 font-medium">{t.category || 'General'}</div>
                      <div className="text-slate-400 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-semibold text-[var(--text)] mb-2">{t.title}</h3>
                    <p className="text-sm text-slate-600">{t.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewTemplateId(id); }} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors">Preview</button>
                    <button onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">Use Template</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer action for selected template */}
        <div className="mt-6 flex justify-end">
        </div>
        
        <TemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={async (templateData) => {
            setCreatingFromTemplate(true);
            try {
              const newForm = {
                title: templateData.title || templateData.form?.title,
                description: templateData.description || templateData.form?.description,
                fields: templateData.fields || templateData.form?.fields || [],
                settings: { isPublic: true },
              };
              const { data } = await formApi.createForm(newForm);
              router.push(`/app/forms/builder/${data._id}`);
            } catch (err) {
              console.error('Error creating form from template:', err);
              alert('Failed to create form from template. Please try again.');
            } finally {
              setCreatingFromTemplate(false);
              setIsTemplateModalOpen(false);
            }
          }}
        />

        {/* Template Preview Modal */}
        {previewTemplateId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm uppercase text-slate-500 font-semibold mb-2">
                    {templates.find(t => t.id === previewTemplateId)?.category}
                  </div>
                  <h2 className="text-2xl font-bold">{templates.find(t => t.id === previewTemplateId)?.title}</h2>
                  <p className="text-slate-600 mt-2">{templates.find(t => t.id === previewTemplateId)?.description}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplateId(null)}
                  className="ml-4 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Form Fields</h3>
                <div className="space-y-3">
                  {templates.find(t => t.id === previewTemplateId)?.fields?.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-indigo-600">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700 font-medium">{field.label || field}</p>
                        <p className="text-xs text-slate-500">{field.type || 'Field'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 bg-slate-50 p-6 flex gap-3">
                <button
                  onClick={() => setPreviewTemplateId(null)}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}