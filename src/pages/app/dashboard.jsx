"use client";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { formApi } from '../../api/formApi';
import { useAuthStore } from '../../store/authStore';
import { TEMPLATE_LIBRARY } from '../../data/templates';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [forms, setForms] = useState([]);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const TEMPLATE_DATA = TEMPLATE_LIBRARY;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleUseTemplate = async (template) => {
    try {
      const detectFieldType = (fieldName) => {
        const lower = fieldName.toLowerCase();
        if (lower.includes('email')) return 'email';
        if (lower.includes('phone') || lower.includes('contact') || lower.includes('number')) return 'number';
        if (lower.includes('resume') || lower.includes('attachment') || lower.includes('file')) return 'file';
        if (lower.includes('comment') || lower.includes('message') || lower.includes('feedback') || lower.includes('description') || lower.includes('requirement')) return 'long_text';
        if (lower.includes('rating') || lower.includes('score') || lower.includes('satisfaction')) return 'rating';
        if (lower.includes('date') || lower.includes('when') || lower.includes('time')) return 'date';
        if (lower.includes('year') || lower.includes('age') || lower.includes('count') || lower.includes('quantity')) return 'number';
        if (lower.includes('yes') || lower.includes('no') || lower.includes('agree') || lower.includes('consent') || lower.includes('recommend')) return 'radio';
        return 'short_text';
      };

      const formFields = (template.fields || []).map((field, idx) => {
        if (typeof field === 'string') {
          const type = detectFieldType(field);
          const optional = ['Special Requirements', 'Comments', 'Recommendation'].includes(field);
          const options = ['yes', 'no'].includes(field.toLowerCase()) || field.toLowerCase().includes('recommend')
            ? ['Yes', 'No']
            : [];
          return {
            _id: `field_${idx}_${Math.random().toString(36).substr(2, 9)}`,
            label: field,
            type,
            required: !optional,
            placeholder: `Enter ${field.toLowerCase()}`,
            options,
            order: idx,
            validation: { required: !optional },
            width: 'full',
          };
        }

        return {
          ...field,
          _id: field._id || `field_${idx}_${Math.random().toString(36).substr(2, 9)}`,
          order: field.order ?? idx,
          width: field.width || 'full',
          validation: field.validation || { required: !!field.required },
        };
      });

      const newForm = {
        title: template.title,
        description: `Based on: ${template.title} template`,
        subtitle: '',
        date: '',
        time: '',
        location: '',
        organizerName: '',
        organizerEmail: '',
        organizerPhone: '',
        customDetails: [],
        fields: formFields,
        settings: { isPublic: true },
      };

      console.log('Creating form with fields:', newForm);
      const { data } = await formApi.createForm(newForm);
      console.log('Form created:', data);
      
      // Small delay to ensure the form is saved
      setTimeout(() => {
        router.push(`/app/forms/builder/${data._id}`);
      }, 300);
    } catch (err) {
      console.error('Error creating form from template:', err);
      setError('Failed to create form from template. Please try again.');
    }
  };

  useEffect(() => {
    const loadForms = async () => {
      try {
        setError(null);
        const [{ data: formsData }, { data: overviewData }] = await Promise.all([
          formApi.getMyForms(),
          formApi.getAnalyticsOverview().catch(() => ({ data: null })),
        ]);
        setForms(formsData || []);
        setOverview(overviewData);
      } catch (err) {
        console.error('Error loading forms:', err);
        if (err.response?.status === 429) {
          setError('You\'ve made too many requests. Please wait a moment and try again.');
        } else {
          setError('Failed to load forms. Please refresh the page.');
        }
        setForms([]);
      }
    };

    loadForms();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* User Greeting */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-xl p-6 md:p-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name || 'there'}! 👋
            </h1>
            <p className="text-indigo-100">
              Ready to create and manage your forms. Your dashboard awaits.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3 flex-1">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-red-600 hover:text-red-700 font-medium mt-1 underline"
                >
                  Refresh page
                </button>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Templates Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--text)]">Start with a Template</h2>
            <Link
              href="/app/templates"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
            >
              View all templates
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Create from Scratch Card */}
            <Link
              href="/app/forms/builder/new"
              className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-all duration-300 bg-white hover:shadow-lg"
            >
              <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-indigo-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Start from Scratch</h3>
                <p className="text-sm text-slate-600">Create a custom form with your own fields</p>
              </div>
            </Link>

            {/* Template Cards */}
            {TEMPLATE_DATA.slice(0, 3).map((template) => {
              const stripeColors = {
                'Events': 'bg-blue-500',
                'HR': 'bg-purple-500',
                'Feedback': 'bg-emerald-500',
                'Education': 'bg-orange-500',
              };
              const stripeClass = stripeColors[template.category] || 'bg-slate-500';

              return (
                <div
                  key={template._id}
                  className="relative group rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden bg-white h-64 flex flex-col"
                >
                  <div className={`${stripeClass} h-2 w-full`} />

                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider bg-slate-50 px-3 py-1 rounded-full w-fit mb-3">
                      {template.category}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mb-2 line-clamp-2">
                      {template.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 flex-1">
                      {template.description}
                    </p>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-900/50 to-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-md rounded-2xl">
                    <div className="flex gap-3 flex-col justify-center items-center px-4">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="w-full bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Template Preview Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 md:px-8 py-6 flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedTemplate.title}</h2>
                  <p className="text-indigo-100">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
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
                  {selectedTemplate.fields.map((field, idx) => (
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
                    onClick={() => setSelectedTemplate(null)}
                    className="flex-1 px-6 py-3 rounded-lg border border-slate-300 text-slate-900 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(null);
                      handleUseTemplate(selectedTemplate);
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

        <div className="text-[var(--text)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-semibold text-[var(--text)]">
              Recent Forms
            </h2>
            <Link
              href="/app/forms"
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
            >
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {forms.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">No forms yet</h3>
              <p className="text-sm text-slate-600 mb-6">
                Create your first form to get started
              </p>
              <Link
                href="/app/forms/builder/new"
                className="btn-primary btn-accent inline-flex"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Form
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {forms.slice(0, 6).map((f) => {
                const categoryMap = {
                  'Workshop Registration': 'Events',
                  'Job Application': 'HR',
                  'Customer Feedback': 'Feedback',
                  'College Admission': 'Education',
                  'Event RSVP': 'Events',
                  'Contact Us': 'General',
                };
                const category = categoryMap[f.title] || 'OTHER';
                const perFormStats = overview?.perForm || [];
                const stat = perFormStats.find((s) => s.id === f._id);
                const respCount = stat?.responses || 0;
                return (
                  <div
                    key={f._id}
                    className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-xs uppercase text-slate-500 font-medium">{category}</div>
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 flex items-center justify-center border border-slate-200">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mb-4 flex-1">
                      <h3 className="font-semibold text-[var(--text)] mb-1 group-hover:text-indigo-500 transition-colors">{f.title}</h3>
                      <p className="text-sm text-slate-600">{f.description || 'Add a description to your form'}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-4 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                        </svg>
                        {respCount} responses
                      </div>
                      <div>{new Date(f.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/app/forms/responses/${f._id}`}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-all text-center"
                      >
                        Results
                      </Link>
                      <Link
                        href={`/app/forms/builder/${f._id}`}
                        className="flex-1 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-200 text-sm font-medium hover:bg-indigo-500/20 transition-all text-center"
                      >
                        Edit Form
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

