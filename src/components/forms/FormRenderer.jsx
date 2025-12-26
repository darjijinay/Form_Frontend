"use client";
import { useEffect, useState } from 'react';
import MatrixField from '../fields/MatrixField';
import SignatureField from '../fields/SignatureField';
import ImageChoiceField from '../fields/ImageChoiceField';
import { validateForm } from '../../utils/validateField';

export default function FormRenderer({ form, isPreview = false, onSubmit }) {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    if (isPreview) return;
    e.preventDefault();

    // Validate all fields
    const answers = form.fields.map((field) => ({
      fieldId: field._id,
      value: formValues[field._id] || '',
    }));

    const validation = validateForm(answers, form.fields);
    if (!validation.isValid) {
      setErrors(validation.errors);
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
  };


  useEffect(() => {
    // Conditional logic will be handled by the renderField function checking formValues
  }, [form, formValues]);

  const shouldShowField = (field) => {
    if (!field.logic || !field.logic.showWhenFieldId) return true;
    const { showWhenFieldId, operator, value: condValue } = field.logic;
    const fieldValue = formValues[showWhenFieldId];
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.fields.map((field) => (
        <div key={field._id} id={`field-wrapper-${field._id}`} className={shouldShowField(field) ? '' : 'hidden'}>
          {renderField(field, isPreview, formValues[field._id], (value) => handleFieldChange(field._id, value), errors[field._id])}
        </div>
      ))}

      {!isPreview && form.fields.length > 0 && (
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
