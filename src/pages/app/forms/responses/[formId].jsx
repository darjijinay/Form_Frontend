"use client";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AppLayout from '../../../../components/layout/AppLayout';
import { formApi } from '../../../../api/formApi';

export default function FormResponsesPage() {
  const router = useRouter();
  const { formId } = router.query;
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!formId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [formRes, responsesRes] = await Promise.all([
          formApi.getForm(formId),
          formApi.getResponses(formId),
        ]);
        setForm(formRes.data);

        // `responsesRes.data` may be an array OR an object like { form, responses }
        const resData = responsesRes.data;
        let list = [];
        if (Array.isArray(resData)) list = resData;
        else if (resData && Array.isArray(resData.responses)) list = resData.responses;
        else list = [];

        setResponses(list);
      } catch (error) {
        console.error('Error loading responses:', error);
        setResponses([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [formId]);

  const handleExportCSV = async () => {
    if (!formId) return;
    setExporting(true);
    try {
      const response = await formApi.exportResponsesCsv(formId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${form?.title || 'responses'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getFieldLabel = (fieldId) => {
    return form?.fields?.find(f => f._id === fieldId)?.label || fieldId;
  };

  const getFieldType = (fieldId) => {
    return form?.fields?.find(f => f._id === fieldId)?.type;
  };

  const summarizeValue = (fieldType, answer) => {
    if (answer === undefined || answer === null) return '-';

    // Arrays
    if (Array.isArray(answer)) return answer.length ? answer.join(', ') : '-';

    // Matrix (object of coordinates)
    if (fieldType === 'matrix' && typeof answer === 'object') {
      const entries = Object.entries(answer || {});
      if (!entries.length) return '-';
      return entries
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(', ');
    }

    // File upload
    if (fieldType === 'file' && typeof answer === 'string') {
      const fileName = answer.split('/').pop();
      return fileName || answer;
    }

    // Signature (data URL)
    if (fieldType === 'signature' && typeof answer === 'string') {
      return 'Signature captured';
    }

    // Image choice stores option id or label
    if (fieldType === 'image_choice') {
      if (typeof answer === 'string') return answer;
      return typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
    }

    // Objects fallback
    if (typeof answer === 'object') return JSON.stringify(answer);

    return answer || '-';
  };

  const getFieldValue = (response, fieldId) => {
    if (!response.answers) return '-';
    const answer = response.answers.find(a => a.fieldId === fieldId);
    if (!answer) return '-';
    const fieldType = getFieldType(fieldId);
    return summarizeValue(fieldType, answer.value);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-slate-300 border-t-indigo-500 rounded-full mb-4"></div>
            <p className="text-slate-600">Loading responses...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
              Form Responses
            </h1>
            <p className="text-slate-600">
              {form?.title} • {responses.length} submission{responses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={exporting || responses.length === 0}
            className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to CSV
              </>
            )}
          </button>
        </div>

        {responses.length === 0 ? (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-2">No responses yet</h3>
            <p className="text-sm text-slate-600">
              Responses will appear here when users submit your form
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left font-semibold text-[var(--text)]">Submitted</th>
                    {form?.fields?.slice(0, 5).map(field => (
                      <th key={field._id} className="px-6 py-4 text-left font-semibold text-[var(--text)]">
                        {field.label}
                      </th>
                    ))}
                    {form?.fields && form.fields.length > 5 && (
                      <th className="px-6 py-4 text-left font-semibold text-[var(--text)] text-xs text-slate-500">
                        +{form.fields.length - 5} more
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {responses.map((response) => (
                    <tr key={response._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(response.createdAt).toLocaleDateString()} {new Date(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      {form?.fields?.slice(0, 5).map(field => (
                        <td key={field._id} className="px-6 py-4 text-[var(--text)] max-w-xs truncate">
                          {getFieldValue(response, field._id)}
                        </td>
                      ))}
                      {form?.fields && form.fields.length > 5 && (
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          <a
                            href={`/app/forms/responses/${formId}/${response._id}`}
                            className="text-indigo-600 hover:underline"
                          >
                            View details →
                          </a>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
              Showing {responses.length} response{responses.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
