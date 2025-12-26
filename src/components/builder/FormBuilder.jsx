"use client";
import { useState, useMemo } from 'react';
import { nanoid } from 'nanoid';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import FieldSettingsPanel from './FieldSettingsPanel';

const DEFAULT_FIELD_CONFIGS = {
  short_text: { label: 'Short answer', placeholder: 'Type your answer' },
  long_text: { label: 'Long answer', placeholder: 'Type your answer' },
  email: { label: 'Email', placeholder: 'example@domain.com' },
  number: { label: 'Number', placeholder: 'Enter a number' },
  date: { label: 'Date', placeholder: '' },
  time: { label: 'Time', placeholder: '' },
  dropdown: { label: 'Dropdown', options: ['Option 1', 'Option 2'] },
  radio: { label: 'Multiple choice', options: ['Option 1', 'Option 2'] },
  checkbox: { label: 'Checkboxes', options: ['Option 1', 'Option 2'] },
  file: { label: 'File Upload', placeholder: 'Choose a file' },
  rating: { label: 'Rating', placeholder: 'Select a rating' },
  matrix: { label: 'Matrix', matrixRows: ['Row 1', 'Row 2'], matrixColumns: ['Column 1', 'Column 2'] },
  signature: { label: 'Signature', placeholder: '' },
  image_choice: { label: 'Image Choice', options: [{label: 'Option 1', url: ''}, {label: 'Option 2', url: ''}] },
};

export default function FormBuilder({ initialForm, onChange }) {
  const [form, setForm] = useState(
    () => initialForm || { title: 'Untitled form', description: '', fields: [], settings: {} }
  );
  const [selectedFieldId, setSelectedFieldId] = useState(null);

  const selectedField = useMemo(
    () => form.fields.find((f) => f._id === selectedFieldId) || null,
    [form.fields, selectedFieldId]
  );

  const updateForm = (updater) => {
    setForm((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onChange?.(next);
      return next;
    });
  };

  const updateMeta = (changes) => {
    updateForm((prev) => ({ ...prev, ...changes }));
  };

  const addField = (type, insertIndex = null) => {
    const base = DEFAULT_FIELD_CONFIGS[type] || { label: 'Untitled', placeholder: '' };

    updateForm((prev) => {
      // Handle options - generate proper IDs for image choice
      let options = base.options || [];
      if (type === 'image_choice') {
        options = base.options?.map(opt => ({
          id: nanoid(),
          label: opt.label,
          url: opt.url
        })) || [];
      }

      const newField = {
        _id: nanoid(),
        type,
        label: base.label,
        placeholder: base.placeholder || '',
        required: false,
        options: options,
        matrixRows: base.matrixRows || [],
        matrixColumns: base.matrixColumns || [],
        order: insertIndex !== null ? insertIndex : prev.fields.length,
        width: 'full',
      };

      let fields;
      if (insertIndex !== null && insertIndex >= 0 && insertIndex <= prev.fields.length) {
        // Insert at specific position
        fields = [...prev.fields];
        fields.splice(insertIndex, 0, newField);
      } else {
        // Add at the end
        fields = [...prev.fields, newField];
      }

      return { 
        ...prev, 
        fields: fields.map((f, idx) => ({ ...f, order: idx }))
      };
    });
  };

  const updateField = (fieldId, changes) => {
    updateForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) =>
        f._id === fieldId ? { ...f, ...changes } : f
      ),
    }));
  };

  const removeField = (fieldId) => {
    updateForm((prev) => ({
      ...prev,
      fields: prev.fields
        .filter((f) => f._id !== fieldId)
        .map((f, idx) => ({ ...f, order: idx })),
    }));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const moveField = (fieldId, direction) => {
    updateForm((prev) => {
      const idx = prev.fields.findIndex((f) => f._id === fieldId);
      if (idx === -1) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.fields.length) return prev;

      const fields = [...prev.fields];
      const [removed] = fields.splice(idx, 1);
      fields.splice(newIdx, 0, removed);
      return {
        ...prev,
        fields: fields.map((f, index) => ({ ...f, order: index })),
      };
    });
  };

  const duplicateField = (fieldId) => {
    updateForm((prev) => {
      const field = prev.fields.find((f) => f._id === fieldId);
      if (!field) return prev;

      const idx = prev.fields.findIndex((f) => f._id === fieldId);
      const newField = {
        ...field,
        _id: nanoid(),
        label: `${field.label} (Copy)`,
        order: idx + 1,
      };

      const fields = [...prev.fields];
      fields.splice(idx + 1, 0, newField);
      
      return {
        ...prev,
        fields: fields.map((f, index) => ({ ...f, order: index })),
      };
    });
  };

  const reorderFields = (newFields) => {
    updateForm((prev) => ({
      ...prev,
      fields: newFields.map((f, index) => ({ ...f, order: index })),
    }));
  };

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden flex flex-col h-full gap-3">
        {/* Mobile Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedFieldId(null)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !selectedFieldId
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Form
          </button>
          <button
            onClick={() => {}}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFieldId
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Mobile Content */}
        {!selectedFieldId ? (
          <div className="flex-1 min-h-0 flex flex-col gap-3">
            {/* Field Palette Dropdown */}
            <details className="bg-white border border-slate-200 rounded-xl">
              <summary className="px-4 py-3 cursor-pointer font-medium text-sm flex items-center justify-between">
                <span>➕ Add Fields</span>
                <span className="text-xs text-slate-400">Click to expand</span>
              </summary>
              <div className="px-2 pb-2 max-h-64 overflow-y-auto">
                <FieldPalette onAddField={addField} />
              </div>
            </details>
            
            {/* Form Canvas */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <FormCanvas
                form={form}
                onSelectField={setSelectedFieldId}
                selectedFieldId={selectedFieldId}
                onMoveField={moveField}
                onRemoveField={removeField}
                onUpdateMeta={updateMeta}
                onDuplicateField={duplicateField}
                onReorderFields={reorderFields}
                onAddField={addField}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <FieldSettingsPanel
              field={selectedField}
              fields={form.fields}
              onChange={(changes) =>
                selectedField && updateField(selectedField._id, changes)
              }
            />
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-[250px_minmax(0,1fr)_280px] gap-4 h-full">
        <FieldPalette onAddField={addField} />
        <FormCanvas
          form={form}
          onSelectField={setSelectedFieldId}
          selectedFieldId={selectedFieldId}
          onMoveField={moveField}
          onRemoveField={removeField}
          onUpdateMeta={updateMeta}
          onDuplicateField={duplicateField}
          onReorderFields={reorderFields}
          onAddField={addField}
        />
        <FieldSettingsPanel
          field={selectedField}
          fields={form.fields}
          onChange={(changes) =>
            selectedField && updateField(selectedField._id, changes)
          }
        />
      </div>
    </>
  );
}
