"use client";
import { useState, useEffect } from 'react';

const FIELD_CATEGORIES = [
  {
    name: 'Basic',
    fields: [
      { type: 'short_text', label: 'Short Text', icon: '📝' },
      { type: 'long_text', label: 'Long Text', icon: '📄' },
      { type: 'number', label: 'Number', icon: '🔢' },
      { type: 'dropdown', label: 'Dropdown', icon: '▼' },
      { type: 'radio', label: 'Multiple Choice', icon: '⊙' },
      { type: 'checkbox', label: 'Checkboxes', icon: '☑' },
    ],
  },
  {
    name: 'Advanced',
    fields: [
      { type: 'date', label: 'Date', icon: '📅' },
      { type: 'time', label: 'Time', icon: '🕐' },
      { type: 'rating', label: 'Rating (1-5)', icon: '⭐' },
      { type: 'file', label: 'File Upload', icon: '📎' },
      { type: 'matrix', label: 'Matrix / Grid', icon: '▦' },
      { type: 'signature', label: 'Signature', icon: '✍' },
      { type: 'image_choice', label: 'Image Choice', icon: '🖼' },
    ],
  },
  {
    name: 'Contact',
    fields: [
      { type: 'email', label: 'Email', icon: '📧' },
    ],
  }
];

const AccordionItem = ({ category, onAddField, isMobile, open, onToggle }) => {
  const handleDragStart = (e, fieldType) => {
    if (isMobile) return;
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('fieldType', fieldType);
    e.dataTransfer.setData('source', 'palette');
    e.dataTransfer.setData('fieldtype', fieldType);
  };

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onToggle}
        className="w-full text-left px-3 py-3 text-sm font-semibold text-slate-700 flex justify-between items-center transition-all hover:bg-slate-50"
      >
        <span>{category.name}</span>
        <span className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="p-2 space-y-2">
          {category.fields.map((f) => (
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
      )}
    </div>
  );
};

export default function FieldPalette({ onAddField }) {
  const [isMobile, setIsMobile] = useState(false);
  const [openCategory, setOpenCategory] = useState(FIELD_CATEGORIES[0].name);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleToggle = (categoryName) => {
    setOpenCategory(openCategory === categoryName ? null : categoryName);
  };

  return (
    <aside className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <h3 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide flex-shrink-0 hidden lg:block">
        Field types
        {!isMobile && <span className="text-xs font-normal text-slate-400 ml-2">(Click or Drag)</span>}
      </h3>
      <div className="flex-1 overflow-y-auto pr-1">
        {FIELD_CATEGORIES.map((category) => (
          <AccordionItem
            key={category.name}
            category={category}
            onAddField={onAddField}
            isMobile={isMobile}
            open={openCategory === category.name}
            onToggle={() => handleToggle(category.name)}
          />
        ))}
      </div>
    </aside>
  );
}