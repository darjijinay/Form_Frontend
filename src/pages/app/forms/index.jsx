"use client";
import AppLayout from '../../../components/layout/AppLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { formApi } from '../../../api/formApi';

export default function MyFormsPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadForms = () => {
    setLoading(true);
    formApi
      .getMyForms()
      .then((res) => setForms(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this form?')) return;
    try {
      await formApi.deleteForm(id);
      setForms((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      let msg = 'Failed to delete form.';
      if (err?.response?.status === 404) {
        msg = 'Form not found or you do not have permission.';
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      alert(msg);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
              My Forms
            </h1>
            <p className="text-slate-600">
              Manage and share your forms
            </p>
          </div>
          <button
            onClick={() => router.push('/app/forms/builder/new')}
            className="btn-primary btn-accent flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Form
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-slate-600">Loading forms...</p>
            </div>
          </div>
        ) : forms.length === 0 ? (
          <div className="bg-white shadow-sm border border-slate-200 p-12 text-center">
            <div className="h-24 w-24 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No forms yet</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Get started by creating your first form. It&apos;s quick and easy!
            </p>
            <button
              onClick={() => router.push('/app/forms/builder/new')}
              className="btn-primary btn-accent inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Form
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((f) => (
              <div
                key={f._id}
                className="bg-white shadow-sm border border-slate-200 p-6 hover:border-indigo-200 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 flex items-center justify-center border border-slate-200 group-hover:border-indigo-200 transition-colors">
                      <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  {f.settings?.isPublic && (
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Public
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-2 line-clamp-2 group-hover:text-indigo-500 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Updated {new Date(f.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/app/forms/builder/${f._id}`}
                    className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:border-indigo-200 hover:text-indigo-500 text-center transition-all"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/app/forms/analytics/${f._id}`}
                    className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:border-purple-200 hover:text-purple-500 text-center transition-all"
                  >
                    Analytics
                  </Link>
                  <Link
                    href={`/app/forms/responses/${f._id}`}
                    className="flex-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:border-emerald-200 hover:text-emerald-500 text-center transition-all"
                  >
                    Responses
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/public/${f._id}`
                      );
                      alert('Link copied to clipboard!');
                    }}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 hover:border-sky-200 hover:text-sky-500 transition-all"
                    title="Copy public link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(f._id)}
                    className="px-3 py-2 text-xs font-medium rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete form"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
