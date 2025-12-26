"use client";
import { useEffect, useState } from 'react';
import { formApi } from '../../api/formApi';

export default function TemplateModal({ isOpen, onClose, onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadTemplates = async () => {
      setLoading(true);
      try {
        const { data } = await formApi.getTemplates();
        setTemplates(data || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [isOpen]);

  const handleCardSelect = (templateId) => {
    setSelectedTemplateId(templateId);
  };

  const handleUse = async () => {
    if (!selectedTemplateId) return;
    try {
      const { data } = await formApi.getTemplate(selectedTemplateId);
      onSelectTemplate(data);
      onClose();
    } catch (err) {
      console.error('Error fetching template:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text)]">Choose a Template</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-slate-300 border-t-indigo-500 rounded-full"></div>
              <p className="text-slate-600 mt-4">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No templates available</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const id = template._id || template.id;
                const title = template.title || template.name;
                const desc = template.description || template.desc || '';
                const category = template.category || 'General';
                const isSelected = selectedTemplateId === id;

                return (
                  <div
                    key={id}
                    onClick={() => handleCardSelect(id)}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between h-full ${
                      isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs uppercase text-slate-500 font-medium">{category}</div>
                        <div className="text-slate-400 text-sm">&nbsp;</div>
                      </div>
                      <h3 className="font-semibold text-[var(--text)] mb-2">{title}</h3>
                      <p className="text-sm text-slate-600">{desc}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">&nbsp;</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-[var(--text)] font-medium hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUse}
            disabled={!selectedTemplateId}
            className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
