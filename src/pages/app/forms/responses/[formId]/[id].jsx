"use client";
import AppLayout from '../../../../../components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { formApi as responsesApi } from '../../../../../api/formApi';

export default function ResponseDetailPage(){
  const router = useRouter();
  const { formId, id } = router.query; // id is response id
  const [response, setResponse] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!formId || !id) return;
    setLoading(true);
    
    // Fetch both the form details and responses
    Promise.all([
      responsesApi.getForm(formId),
      responsesApi.getResponses(formId)
    ])
      .then(([formRes, responsesRes]) => {
        setForm(formRes.data);
        const data = responsesRes.data;
        const responses = Array.isArray(data) ? data : (data?.responses || []);
        const found = responses.find(r => String(r._id) === String(id));
        setResponse(found || null);
      })
      .catch((e)=>{
        console.error('Error loading response detail', e);
        setResponse(null);
      })
      .finally(()=>setLoading(false));
  },[formId, id]);

  const getFieldLabel = (fieldId) => {
    if (!form?.fields) return fieldId;
    const field = form.fields.find(f => f._id === fieldId);
    return field?.label || fieldId;
  };

  const getField = (fieldId) => form?.fields?.find((f) => f._id === fieldId);

  const renderMatrix = (field, value) => {
    const rows = field?.matrixRows || [];
    const cols = field?.matrixColumns || [];
    if (!rows.length || !cols.length || typeof value !== 'object') {
      return <pre className="text-xs text-slate-600 bg-slate-50 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
    }
    return (
      <div className="overflow-x-auto">
        <table className="text-sm border border-slate-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left bg-slate-50 border-b border-slate-200">&nbsp;</th>
              {cols.map((c) => (
                <th key={c} className="px-3 py-2 text-left bg-slate-50 border-b border-slate-200">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r} className="border-b border-slate-200">
                <td className="px-3 py-2 font-medium bg-slate-50 border-r border-slate-200">{r}</td>
                {cols.map((c) => {
                  const key = `${rows.indexOf(r)}-${cols.indexOf(c)}`;
                  const val = value?.[key];
                  return (
                    <td key={c} className="px-3 py-2">
                      {val ? '✔' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderImageChoice = (field, value) => {
    if (!field) return String(value ?? '');
    const option = (field.options || []).find((opt) => opt.id === value || opt.label === value);
    if (!option) return String(value ?? '');
    return (
      <div className="flex items-center gap-3">
        {option.url ? <img src={option.url} alt={option.label} className="h-16 w-16 object-cover rounded border" /> : null}
        <div>
          <div className="font-medium text-slate-900">{option.label}</div>
        </div>
      </div>
    );
  };

  const formatValue = (value, fieldId) => {
    const field = getField(fieldId);

    if (value === null || value === undefined) {
      return <span className="text-slate-400 italic">Not answered</span>;
    }

    // Arrays (checkbox etc.)
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : <span className="text-slate-400 italic">None selected</span>;
    }

    // File upload
    if (field?.type === 'file' && typeof value === 'string') {
      const fileName = value.split('/').pop();
      return (
        <a href={value} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
          {fileName || value}
        </a>
      );
    }

    // Signature (data URL)
    if (field?.type === 'signature' && typeof value === 'string' && value.startsWith('data:image')) {
      return <img src={value} alt="Signature" className="max-h-40 border rounded" />;
    }

    // Matrix
    if (field?.type === 'matrix') {
      return renderMatrix(field, value);
    }

    // Image choice
    if (field?.type === 'image_choice') {
      return renderImageChoice(field, value);
    }

    // Objects fallback
    if (typeof value === 'object') {
      return (
        <pre className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    // Booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/app/forms/responses/${formId}`)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold mb-2"
          >
            ← Back to All Responses
          </button>
          <h2 className="text-3xl font-bold text-slate-900">Response Details</h2>
          {form && (
            <p className="text-slate-600 mt-1">for {form.title}</p>
          )}
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <div className="animate-pulse text-slate-600">Loading response...</div>
          </div>
        ) : !response ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <div className="text-slate-600">Response not found.</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Submission Info Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900">Submission Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <div className="text-xs font-medium text-slate-600 uppercase mb-1">Submitted On</div>
                  <div className="text-base font-semibold text-slate-900">
                    {new Date(response.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-600 uppercase mb-1">Time</div>
                  <div className="text-base font-semibold text-slate-900">
                    {new Date(response.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Responses Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900">Form Answers</h3>
              </div>
              
              <div className="space-y-6">
                {response.answers && response.answers.length > 0 ? (
                  response.answers.map((a, idx) => (
                    <div key={a.fieldId || idx} className="border-l-4 border-indigo-200 pl-4 py-2">
                      <div className="text-sm font-semibold text-slate-700 mb-2">{getFieldLabel(a.fieldId)}</div>
                      <div className="text-base text-slate-900">{formatValue(a.value, a.fieldId)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-8 italic">No answers recorded</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
