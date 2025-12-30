"use client";
import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import TemplateModal from '../../components/templates/TemplateModal';
import TemplateGallery from '../../components/templates/TemplateGallery';
import { useRouter } from 'next/router';
import { formApi } from "../../api/formApi";
import { templateApi } from "../../api/templateApi";
import Link from "next/link";
import { TEMPLATE_LIBRARY } from "../../data/templates";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(TEMPLATE_LIBRARY);
  const [loading, setLoading] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Temporarily disable API call to debug
    setLoading(false);
    // formApi
    //   .getTemplates()
    //   .then((res) => {
    //     if (res.data && res.data.length > 0) {
    //       setTemplates(res.data);
    //     }
    //   })
    //   .catch(() => {
    //     // Keep FALLBACK_TEMPLATES on error
    //   })
    //   .finally(() => setLoading(false));
  }, []);

  const handleUseTemplate = async (tpl) => {
    try {
      setCreatingFromTemplate(true);
      const normalizedFields = (tpl.fields || []).map((field, idx) => ({
        ...field,
        _id: field._id || `field_${idx}_${Math.random().toString(36).slice(2, 8)}`,
        order: field.order ?? idx,
        width: field.width || 'full',
        validation: field.validation || { required: !!field.required },
      }));

      const payload = { 
        sourceTemplate: tpl._id,
        ...tpl.formDetails,
        title: tpl.formDetails?.title || tpl.title, 
        description: tpl.formDetails?.description || tpl.description, 
        fields: normalizedFields,
        settings: { isPublic: true }
      };
      const res = await formApi.createForm(payload);
      const id = res.data?._id;
      if (id) router.push(`/app/forms/builder/${id}`);
      else router.push('/app/forms');
    } catch (e) {
      console.error('Error creating form from template:', e);
      router.push('/app/forms/builder/new');
    } finally {
      setCreatingFromTemplate(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Templates</h1>
            <p className="text-sm sm:text-base text-slate-600">Start with a pre-built template to save time.</p>
          </div>
          {/* Removed top-right "From Template" button as requested */}
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => {
            const id = t._id || t.id;
            const category = (t.category || 'General').toLowerCase();

            const colorMap = {
              events: 'bg-rose-400',
              hr: 'bg-emerald-400',
              feedback: 'bg-violet-400',
              education: 'bg-orange-400',
              general: 'bg-sky-400',
            };

            const stripeClass = colorMap[category] || 'bg-sky-400';

            return (
              <div
                key={id}
                className="relative rounded-xl border-2 transition-all flex flex-col justify-between h-full overflow-hidden shadow-sm hover:shadow-md border-slate-200 hover:border-slate-300 bg-white"
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
                    <button onClick={(e) => { e.stopPropagation(); setPreviewTemplate(t); }} className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors">Preview</button>
                    <button onClick={(e) => { e.stopPropagation(); handleUseTemplate(t); }} className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition-colors">Use Template</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 md:px-8 py-6 flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{previewTemplate.title}</h2>
                  <p className="text-indigo-100">{previewTemplate.description}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="ml-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 md:p-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Template Fields</h3>
                <div className="space-y-3 mb-6">
                  {(previewTemplate.fields || []).map((field, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-slate-900">{typeof field === 'string' ? field : (field?.label || 'Field')}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="flex-1 px-6 py-3 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      const tpl = previewTemplate; setPreviewTemplate(null); await handleUseTemplate(tpl);
                    }}
                    className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Use This Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
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
      </div>
    </AppLayout>
  );
}
