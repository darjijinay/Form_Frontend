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
  const [allResponses, setAllResponses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

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
      
      // Load all responses for summary and question views
      const allResponsesRes = await formApi.getResponses(formId, { limit: 1000 });
      setAllResponses(allResponsesRes.data.responses || []);
      
      // Load paginated responses for individual view
      const params = { page, limit: 10, sortBy, sortOrder, search: debouncedSearch };
      const responsesRes = await formApi.getResponses(formId, params);
      
      const resData = responsesRes.data;
      setResponses(resData.responses || []);
      setPagination(resData.pagination || null);

    } catch (error) {
      console.error('Error loading responses:', error);
      setResponses([]);
      setAllResponses([]);
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

  // Aggregate responses for summary view
  const aggregateFieldData = (field) => {
    const answers = allResponses.map(r => 
      r.answers?.find(a => a.fieldId === field._id)?.value
    ).filter(v => v !== undefined && v !== null && v !== '');

    const total = answers.length;
    
    if (['radio', 'dropdown'].includes(field.type)) {
      const counts = {};
      answers.forEach(answer => {
        const val = String(answer);
        counts[val] = (counts[val] || 0) + 1;
      });
      return { type: 'choice', counts, total };
    }
    
    if (field.type === 'checkbox') {
      const counts = {};
      answers.forEach(answer => {
        const vals = Array.isArray(answer) ? answer : [answer];
        vals.forEach(val => {
          counts[val] = (counts[val] || 0) + 1;
        });
      });
      return { type: 'multiple_choice', counts, total };
    }
    
    if (field.type === 'rating') {
      const counts = {};
      let sum = 0;
      answers.forEach(answer => {
        const rating = Number(answer);
        counts[rating] = (counts[rating] || 0) + 1;
        sum += rating;
      });
      const average = total > 0 ? (sum / total).toFixed(1) : 0;
      return { type: 'rating', counts, total, average };
    }
    
    return { type: 'text', responses: answers.slice(0, 10), total };
  };

  const renderPagination = () => {
    if (!pagination || pagination.pages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Page {pagination.page} of {pagination.pages} ({pagination.total} total responses)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)] mb-2">{allResponses.length} Responses</h1>
            <p className="text-slate-600">{form?.title}</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              disabled={exporting || allResponses.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 flex-shrink-0"
            >
              <span>📊</span>
              {exporting ? 'Exporting...' : 'View in Sheets'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'summary'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('question')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'question'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Question
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'individual'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Individual
            </button>
          </div>

          {loading && allResponses.length === 0 ? (
             <div className="p-12 text-center"><p className="text-slate-600">Loading responses...</p></div>
          ) : !loading && allResponses.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-medium text-slate-700 mb-2">No responses yet</h3>
              <p className="text-sm text-slate-600">Responses will appear here when users submit your form</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
            {/* Summary View */}
            {activeTab === 'summary' && (
              <div className="space-y-8">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="text-lg font-semibold mb-2">Who has responded?</h3>
                  <div className="space-y-2">
                    {allResponses.slice(0, 10).map((response, idx) => {
                      const emailField = form?.fields?.find(f => f.type === 'email');
                      const emailAnswer = emailField ? response.answers?.find(a => a.fieldId === emailField._id) : null;
                      const email = emailAnswer?.value || `Response ${idx + 1}`;
                      return (
                        <div key={response._id} className="text-sm text-slate-700">{email}</div>
                      );
                    })}
                    {allResponses.length > 10 && (
                      <div className="text-sm text-slate-500">+{allResponses.length - 10} more</div>
                    )}
                  </div>
                </div>

                {form?.fields?.map(field => {
                  const aggregated = aggregateFieldData(field);
                  return (
                    <div key={field._id} className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-800">{field.label}</h3>
                      <p className="text-sm text-slate-600">{aggregated.total} responses</p>

                      {aggregated.type === 'choice' && (
                        <div className="space-y-2">
                          {Object.entries(aggregated.counts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([option, count]) => {
                              const percentage = ((count / aggregated.total) * 100).toFixed(1);
                              return (
                                <div key={option} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700">{option}</span>
                                    <span className="text-slate-500">{count} ({percentage}%)</span>
                                  </div>
                                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-indigo-600 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {aggregated.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {Object.entries(aggregated.counts)
                            .sort((a, b) => b[1] - a[1])
                            .map(([option, count]) => {
                              const percentage = ((count / aggregated.total) * 100).toFixed(1);
                              return (
                                <div key={option} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700">{option}</span>
                                    <span className="text-slate-500">{count} ({percentage}%)</span>
                                  </div>
                                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-indigo-600 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {aggregated.type === 'rating' && (
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-indigo-600">{aggregated.average}</div>
                          <div className="space-y-1">
                            {Object.entries(aggregated.counts)
                              .sort((a, b) => b[0] - a[0])
                              .map(([rating, count]) => {
                                const percentage = ((count / aggregated.total) * 100).toFixed(1);
                                return (
                                  <div key={rating} className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600 w-8">{rating}</span>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-indigo-600 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-slate-500 w-12">{count}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {aggregated.type === 'text' && (
                        <div className="space-y-2">
                          {aggregated.responses.map((answer, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                              {answer}
                            </div>
                          ))}
                          {aggregated.total > 10 && (
                            <button className="text-sm text-indigo-600 hover:underline">
                              View all {aggregated.total} responses →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Question View */}
            {activeTab === 'question' && (
              <div className="space-y-8">
                {form?.fields?.map(field => {
                  const answers = allResponses.map((r, idx) => ({
                    response: r,
                    index: idx + 1,
                    value: r.answers?.find(a => a.fieldId === field._id)?.value
                  })).filter(a => a.value !== undefined && a.value !== null && a.value !== '');

                  return (
                    <div key={field._id} className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-800">{field.label}</h3>
                      <p className="text-sm text-slate-600">{answers.length} responses</p>
                      <div className="space-y-2">
                        {answers.map((answer) => (
                          <div key={answer.response._id} className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 text-sm text-slate-700">
                                {Array.isArray(answer.value) 
                                  ? answer.value.join(', ') 
                                  : String(answer.value)}
                              </div>
                              <div className="text-xs text-slate-500 flex-shrink-0">
                                {new Date(answer.response.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Individual View */}
            {activeTab === 'individual' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <input 
                    type="text"
                    placeholder="Search responses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-300 flex-1"
                  />
                </div>

                {responses.map((response, idx) => (
                  <div key={response._id} className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h3 className="font-semibold text-slate-800">Response #{(page - 1) * 10 + idx + 1}</h3>
                      <span className="text-sm text-slate-500">
                        {new Date(response.createdAt).toLocaleDateString()} {new Date(response.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {form?.fields?.map(field => {
                        const answer = response.answers?.find(a => a.fieldId === field._id);
                        if (!answer || !answer.value) return null;
                        return (
                          <div key={field._id} className="space-y-1">
                            <div className="text-sm font-medium text-slate-600">{field.label}</div>
                            <div className="text-sm text-slate-900">
                              {Array.isArray(answer.value)
                                ? answer.value.join(', ')
                                : String(answer.value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="mt-6 pt-4 border-t border-slate-200">
                  {renderPagination()}
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
    );
}
