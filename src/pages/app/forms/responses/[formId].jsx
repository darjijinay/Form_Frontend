"use client";
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '../../../../components/layout/AppLayout';
import { formApi } from '../../../../api/formApi';
import { useDebounce } from '../../../../hooks/useDebounce';

export default function FormResponsesPage() {
  const router = useRouter();
  const { formId } = router.query;
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const loadData = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    try {
      // Form info is fetched once
      if (!form) {
        const formRes = await formApi.getForm(formId);
        setForm(formRes.data);
      }
      
      const params = { page, limit: 10, sortBy, sortOrder, search: debouncedSearch };
      const responsesRes = await formApi.getResponses(formId, params);
      
      const resData = responsesRes.data;
      setResponses(resData.responses || []);
      setPagination(resData.pagination || null);

    } catch (error) {
      console.error('Error loading responses:', error);
      setResponses([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [formId, page, sortBy, sortOrder, debouncedSearch, form]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleSort = (fieldId) => {
    const newSortOrder = sortBy === fieldId && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(fieldId);
    setSortOrder(newSortOrder);
    setPage(1);
  };
  
  const getFieldType = (fieldId) => {
    return form?.fields?.find(f => f._id === fieldId)?.type;
  };

  const summarizeValue = (fieldType, answer) => {
    if (answer === undefined || answer === null) return '-';
    if (Array.isArray(answer)) return answer.length ? answer.join(', ') : '-';
    if (fieldType === 'matrix' && typeof answer === 'object') {
      const entries = Object.entries(answer || {});
      if (!entries.length) return '-';
      return entries.filter(([, v]) => v).map(([k]) => k).join(', ');
    }
    if (fieldType === 'file' && typeof answer === 'string') return answer.split('/').pop() || answer;
    if (fieldType === 'signature' && typeof answer === 'string') return 'Signature captured';
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

  const renderPagination = () => {
    if (!pagination || pagination.total <= pagination.limit) return null;
    const { page, totalPages, limit, total } = pagination;
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm">Showing {start} to {end} of {total} responses</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-3 py-1 rounded-md border bg-white disabled:opacity-50">Previous</button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-3 py-1 rounded-md border bg-white disabled:opacity-50">Next</button>
        </div>
      </div>
    );
  };

  const SortableHeader = ({ label, fieldId }) => {
    const isSorted = sortBy === fieldId;
    return (
      <th 
        className="px-6 py-4 text-left font-semibold text-[var(--text)] cursor-pointer hover:bg-slate-100"
        onClick={() => handleSort(fieldId)}
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isSorted && (
            <span className="text-indigo-500">{sortOrder === 'desc' ? '↓' : '↑'}</span>
          )}
        </div>
      </th>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Form Responses</h1>
            <p className="text-slate-600">{form?.title} • {pagination?.total || 0} submission{pagination?.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <input 
              type="text"
              placeholder="Search responses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-300 w-full sm:w-64"
            />
            <button
              onClick={handleExportCSV}
              disabled={exporting || responses.length === 0}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 flex-shrink-0"
            >
              {exporting ? 'Exporting...' : 'Export to CSV'}
            </button>
          </div>
        </div>

        {loading && responses.length === 0 ? (
           <div className="text-center p-12"><p className="text-slate-600">Loading responses...</p></div>
        ) : !loading && responses.length === 0 ? (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-12 text-center">
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              {debouncedSearch ? 'No matching responses' : 'No responses yet'}
            </h3>
            <p className="text-sm text-slate-600">
              {debouncedSearch ? 'Try a different search term.' : 'Responses will appear here when users submit your form'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <SortableHeader label="Submitted" fieldId="createdAt" />
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
              {renderPagination()}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
