"use client";
import { useEffect, useState, useMemo } from 'react';
import MatrixField from '../fields/MatrixField';
import SignatureField from '../fields/SignatureField';
import ImageChoiceField from '../fields/ImageChoiceField';
import { validateForm } from '../../utils/validateField';

export default function FormRenderer({ form, isPreview = false, onSubmit }) {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [isExplicitSubmit, setIsExplicitSubmit] = useState(false);

  // Helper function to check if field should be shown based on conditional logic
  const shouldShowField = (field, values) => {
    if (!field.logic || !field.logic.showWhenFieldId) return true;
    const { showWhenFieldId, operator, value: condValue } = field.logic;
    const fieldValue = values[showWhenFieldId];
    if (fieldValue === undefined || fieldValue === null) return false;
    
    const op = operator || 'equals';
    const val = String(fieldValue);
    const targetVal = String(condValue || '');
    
    switch (op) {
      case 'equals':
        return val === targetVal;
      case 'not_equals':
        return val !== targetVal;
      case 'contains':
        return val.includes(targetVal);
      default:
        return true;
    }
  };

  // Calculate pagination
  const questionsPerPage = form.settings?.questionsPerPage || 0;
  const isPaginated = questionsPerPage > 0;

  // Get all fields and visible fields (respecting conditional logic)
  const allFields = useMemo(() => (form?.fields && Array.isArray(form.fields) ? form.fields : []), [form?.fields]);
  const visibleFields = useMemo(() => {
    return allFields.filter(field => shouldShowField(field, formValues));
  }, [allFields, formValues]);

  // Calculate pages based on the full field count so pages are not skipped
  const totalPages = isPaginated
    ? Math.max(1, Math.ceil(allFields.length / questionsPerPage))
    : 1;

  // Debug logging
  useEffect(() => {
    console.log('FormRenderer Debug:', {
      questionsPerPage,
      isPaginated,
      totalFieldsCount: allFields.length,
      visibleFieldsCount: visibleFields.length,
      totalPages,
      currentPage,
    });
  }, [questionsPerPage, isPaginated, allFields.length, visibleFields.length, totalPages, currentPage]);

  // Get current page fields (slice by full list, then filter visibility)
  const currentPageFields = useMemo(() => {
    if (!isPaginated) return visibleFields;
    const startIdx = currentPage * questionsPerPage;
    const endIdx = startIdx + questionsPerPage;
    const pageSlice = allFields.slice(startIdx, endIdx);
    // Only show fields that pass conditional logic
    return pageSlice.filter(field => shouldShowField(field, formValues));
  }, [visibleFields, allFields, currentPage, questionsPerPage, isPaginated, formValues]);

  const handleFieldChange = (fieldId, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: null }));
    }
  };

  const handleKeyDown = (e) => {
    // Prevent form submission on Enter in paginated forms
    // User must click Next/Submit button explicitly
    if (e.key === 'Enter' && isPaginated && !isPreview) {
      e.preventDefault();
      
      // If not on last page, go to next page
      if (currentPage < totalPages - 1) {
        if (validateCurrentPage()) {
          setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      // If on last page, do nothing - user must click Submit button
    }
  };

  const validateCurrentPage = () => {
    // Validate only fields on the current page
    const answers = currentPageFields.map((field) => ({
      fieldId: field._id,
      value: formValues[field._id] || '',
    }));

    const validation = validateForm(answers, currentPageFields);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }
    
    // Clear errors for current page if validation passes
    setErrors((prev) => {
      const newErrors = { ...prev };
      currentPageFields.forEach(field => {
        delete newErrors[field._id];
      });
      return newErrors;
    });
    
    return true;
  };

  const handleNext = () => {
    if (isPreview) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
      return;
    }

    // Validate current page before moving to next
    if (validateCurrentPage()) {
      setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
    // Clear errors when going back
    setErrors({});
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    if (isPreview) return;
    e.preventDefault();

    // In paginated forms, only allow actual submission if user clicked Submit button explicitly
    if (isPaginated && !isExplicitSubmit) {
      console.log('Submission blocked: not an explicit submit click');
      return;
    }

    // If not on the last page, treat submit as "Next" (safety guard)
    if (isPaginated && currentPage < totalPages - 1) {
      if (validateCurrentPage()) {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsExplicitSubmit(false);
      return;
    }

    // If paginated, validate current page first
    if (isPaginated && !validateCurrentPage()) {
      setIsExplicitSubmit(false);
      return;
    }

    // Validate all fields (full form)
    const answers = form.fields.map((field) => ({
      fieldId: field._id,
      value: formValues[field._id] || '',
    }));

    const validation = validateForm(answers, form.fields);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // If there are errors on previous pages, go to first page with errors
      if (isPaginated) {
        const errorFields = Object.keys(validation.errors);
        const errorFieldIdx = visibleFields.findIndex(f => errorFields.includes(f._id));
        if (errorFieldIdx >= 0) {
          const errorPage = Math.floor(errorFieldIdx / questionsPerPage);
          setCurrentPage(errorPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      setIsExplicitSubmit(false);
      return;
    }

    // Build answers array, uploading files when necessary
    const finalAnswers = [];

    for (const field of form.fields) {
      try {
        if (field.type === 'file') {
          const value = formValues[field._id];
          if (value instanceof File) {
            const fd = new FormData();
            fd.append('file', value);
            const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
            const uploadEndpoint = `${apiBase}/uploads`;
            const res = await fetch(uploadEndpoint, {
              method: 'POST',
              body: fd,
            });
            if (res.ok) {
              const body = await res.json();
              finalAnswers.push({ fieldId: field._id, value: body.url || body.filename });
            } else {
              finalAnswers.push({ fieldId: field._id, value: value.name });
            }
          } else {
            finalAnswers.push({ fieldId: field._id, value: value || null });
          }
        } else {
          finalAnswers.push({ fieldId: field._id, value: formValues[field._id] || null });
        }
      } catch (err) {
        finalAnswers.push({ fieldId: field._id, value: null });
      }
    }

    onSubmit?.(finalAnswers);
    setIsExplicitSubmit(false);
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
      {/* Page indicator for paginated forms */}
      {isPaginated && !isPreview && (
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors ${
                  i === currentPage
                    ? 'bg-indigo-600'
                    : i < currentPage
                    ? 'bg-indigo-300'
                    : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Render current page fields */}
      {currentPageFields.map((field) => (
        <div key={field._id} id={`field-wrapper-${field._id}`}>
          {renderField(field, isPreview, formValues[field._id], (value) => handleFieldChange(field._id, value), errors[field._id])}
        </div>
      ))}

      {/* Navigation buttons for paginated forms */}
      {isPaginated && !isPreview && (
        <div className="flex justify-between items-center pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentPage === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-600 hover:bg-slate-700 text-white'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {currentPage < totalPages - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white"
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              onClick={() => setIsExplicitSubmit(true)}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-sm font-medium text-white"
            >
              Submit
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Single submit button for non-paginated forms */}
      {!isPaginated && !isPreview && form.fields.length > 0 && (
        <button
          type="submit"
          className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white"
        >
          Submit
        </button>
      )}
    </form>
  );
}

function renderField(field, isPreview, value, onChange, error) {
  const commonProps = {
    required: field.required,
    disabled: isPreview,
    className: `input ${error ? 'border-red-500 bg-red-50' : ''}`,
  };

  // Special components for new field types
  if (field.type === 'matrix') {
    return <MatrixField field={field} value={value} onChange={onChange} />;
  }
  if (field.type === 'signature') {
    return <SignatureField field={field} value={value} onChange={onChange} />;
  }
  if (field.type === 'image_choice') {
    return <ImageChoiceField field={field} value={value} onChange={onChange} />;
  }

  // Standard HTML form fields
  switch (field.type) {
    case 'short_text':
    case 'email':
    case 'number':
    case 'date':
    case 'time':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={field.type === 'short_text' ? 'text' : field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            {...commonProps}
          />
          {error && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><span>⚠️</span> {error}</p>}
        </div>
      );

    case 'long_text':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            {...commonProps}
          />
          {error && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><span>⚠️</span> {error}</p>}
        </div>
      );

    case 'dropdown':
      return (
        <div className="space-y-1 relative">
          <label className="block text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              {...commonProps}
              className={commonProps.className + ' pr-10 appearance-none'}
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {/* Professional dropdown icon */}
            <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          {error && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><span>⚠️</span> {error}</p>}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={value === opt}
                  onChange={() => onChange(opt)}
                  disabled={isPreview}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><span>⚠️</span> {error}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt)}
                  onChange={(e) => {
                    const newVal = e.target.checked ? [...(value || []), opt] : (value || []).filter(v => v !== opt);
                    onChange(newVal);
                  }}
                  disabled={isPreview}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><span>⚠️</span> {error}</p>}
        </div>
      );

    case 'file':
      const fileTypes = field.fileTypes || '.pdf,.doc,.docx,.jpg,.png';
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0])}
            accept={fileTypes}
            {...commonProps}
          />
          <p className="text-xs text-slate-500">
            Max size: {field.maxFileSize || 5} MB. Allowed types: {fileTypes}
          </p>
        </div>
      );

    case 'rating':
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onChange(star)}
                disabled={isPreview}
                className={`w-8 h-8 transition-colors ${
                  value === star || value >= star
                    ? 'text-yellow-400'
                    : 'text-slate-300 hover:text-yellow-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            {...commonProps}
          />
        </div>
      );
  }
}
