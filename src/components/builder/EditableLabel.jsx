"use client";
import { useState } from 'react';

export default function EditableLabel({ fieldKey, value, onUpdate, defaultLabel, formTemplate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(fieldKey, text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      handleBlur();
    }
  };

  const getLabel = () => {
    return defaultLabel;
  }

  if (isEditing) {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full px-1 py-0.5 border border-indigo-300 rounded-md text-sm font-semibold text-slate-900 bg-white"
      />
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className="flex items-center gap-2 cursor-pointer group rounded-md p-1 -m-1 hover:bg-indigo-50 transition-colors">
      <span className="block text-sm font-semibold text-slate-900">{value || getLabel()}</span>
      <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 6.732z" /></svg>
    </div>
  );
}
