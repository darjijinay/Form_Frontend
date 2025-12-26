"use client";
import { useState, useEffect } from 'react';

const FIELDS = [
  { type: 'short_text', label: 'Short Text', icon: '📝' },
  { type: 'long_text', label: 'Long Text', icon: '📄' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'time', label: 'Time', icon: '🕐' },
  { type: 'dropdown', label: 'Dropdown', icon: '▼' },
  { type: 'radio', label: 'Multiple Choice (Radio)', icon: '⊙' },
  { type: 'checkbox', label: 'Checkboxes', icon: '☑' },
  { type: 'rating', label: 'Rating (1-5)', icon: '⭐' },
  { type: 'file', label: 'File Upload', icon: '📎' },
  { type: 'matrix', label: 'Matrix / Grid', icon: '▦' },
  { type: 'signature', label: 'Signature', icon: '✍' },
  { type: 'image_choice', label: 'Image Choice', icon: '🖼' },
];

export default function FieldPalette({ onAddField }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragStart = (e, fieldType) => {
    if (isMobile) return;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('fieldType', fieldType);
    e.dataTransfer.setData('source', 'palette');
    // Add a custom type for detection
    e.dataTransfer.setData('fieldtype', fieldType);
  };

  return (
    <aside className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide flex-shrink-0 hidden lg:block">
        Field types
        {!isMobile && <span className="text-xs font-normal text-slate-400 ml-2">(Click or Drag)</span>}
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {FIELDS.map((f) => (
          <button
            key={f.type}
            onClick={() => onAddField(f.type)}
            draggable={!isMobile}
            onDragStart={(e) => handleDragStart(e, f.type)}
            className="w-full text-left px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-sm flex justify-between items-center transition-all border border-slate-200 cursor-pointer active:cursor-grabbing select-none hover:border-indigo-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{f.icon}</span>
              <span className="text-[var(--text)] text-sm">{f.label}</span>
            </div>
            <span className="text-xs text-slate-400 font-bold">+</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
