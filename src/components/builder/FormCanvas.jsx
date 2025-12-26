"use client";
import { useState, useEffect } from 'react';
import FormRenderer from '../forms/FormRenderer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableField({ field, selectedFieldId, onSelectField, onRemoveField, onDuplicateField }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const handleFieldClick = (e) => {
    // Don't select if clicking on the drag handle
    if (e.target.closest('.drag-handle')) {
      return;
    }
    onSelectField(field._id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleFieldClick}
      className={`rounded-xl border px-4 py-3 relative bg-white transition-all ${
        selectedFieldId === field._id
          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-100'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="drag-handle cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-700 p-1.5 -ml-1 touch-none select-none hover:bg-slate-100 rounded transition-colors"
            role="button"
            aria-label="Drag to reorder"
            tabIndex={-1}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="pointer-events-none">
              <circle cx="4" cy="4" r="1.5" />
              <circle cx="4" cy="8" r="1.5" />
              <circle cx="4" cy="12" r="1.5" />
              <circle cx="8" cy="4" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="12" r="1.5" />
            </svg>
          </div>
          <span className="text-xs font-semibold uppercase text-slate-500 tracking-wide">{field.type}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateField(field._id);
            }}
            className="text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="Duplicate field"
          >
            ⎘
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveField(field._id);
            }}
            className="text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="pl-1">
        <FormRenderer form={{ fields: [field] }} isPreview />
      </div>
    </div>
  );
}

export default function FormCanvas({
  form,
  onSelectField,
  selectedFieldId,
  onMoveField,
  onRemoveField,
  onUpdateMeta,
  onDuplicateField,
  onReorderFields,
  onAddField,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDraggingFromPalette, setIsDraggingFromPalette] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = form.fields.findIndex((f) => f._id === active.id);
      const newIndex = form.fields.findIndex((f) => f._id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = arrayMove(form.fields, oldIndex, newIndex);
        onReorderFields?.(newFields);
      }
    }
  };

  // Handle drag from palette
  const handleDragOver = (e) => {
    if (isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    
    // Set dragging state if we have fieldType data
    if (e.dataTransfer.types.includes('fieldtype')) {
      setIsDraggingFromPalette(true);
    }
  };

  const handleDrop = (e, insertIndex) => {
    if (isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    
    const fieldType = e.dataTransfer.getData('fieldType');
    const source = e.dataTransfer.getData('source');
    
    // Reset states
    setDragOverIndex(null);
    setIsDraggingFromPalette(false);
    
    if (source === 'palette' && fieldType) {
      onAddField?.(fieldType, insertIndex);
    }
  };

  const handleDragEnter = (e, index) => {
    if (isMobile) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Check if we're dragging from palette
    if (e.dataTransfer.types.includes('fieldtype')) {
      setIsDraggingFromPalette(true);
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    if (isMobile) return;
    e.preventDefault();
    
    // Only clear if leaving the drop zone and not entering another one
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleCanvasDragLeave = (e) => {
    if (isMobile) return;
    
    // Only clear if leaving the entire canvas
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
      setIsDraggingFromPalette(false);
    }
  };

  return (
    <section 
      className="bg-white/90 border border-slate-200 rounded-2xl p-4 overflow-y-auto"
      onDragOver={handleDragOver}
      onDragLeave={handleCanvasDragLeave}
    >
      <div className="mb-4">
        <input
          className="bg-transparent text-2xl font-semibold outline-none border-b border-transparent focus:border-indigo-500 pb-1 w-full"
          value={form.title || ''}
          onChange={(e) => onUpdateMeta?.({ title: e.target.value })}
          placeholder="Untitled form"
        />
        <textarea
          className="w-full text-sm text-slate-600 mt-1 bg-transparent border border-transparent focus:border-indigo-200 rounded-lg outline-none resize-none"
          rows={2}
          value={form.description || ''}
          onChange={(e) => onUpdateMeta?.({ description: e.target.value })}
          placeholder="Add a short description"
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={form.fields.map((f) => f._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {/* Drop zone before first field */}
            {!isMobile && form.fields.length > 0 && (
              <div
                onDragEnter={(e) => handleDragEnter(e, 0)}
                onDrop={(e) => handleDrop(e, 0)}
                className={`transition-all duration-200 ${
                  dragOverIndex === 0 && isDraggingFromPalette
                    ? 'h-16 border-2 border-dashed border-indigo-500 bg-indigo-50/50 rounded-xl flex items-center justify-center text-sm font-medium text-indigo-600'
                    : 'h-1 hover:h-12 hover:border-2 hover:border-dashed hover:border-slate-300 hover:bg-slate-50 rounded-lg'
                }`}
              >
                {dragOverIndex === 0 && isDraggingFromPalette && (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Drop here to add field
                  </span>
                )}
              </div>
            )}

            {form.fields.map((field, index) => (
              <div key={field._id}>
                <SortableField
                  field={field}
                  selectedFieldId={selectedFieldId}
                  onSelectField={onSelectField}
                  onRemoveField={onRemoveField}
                  onDuplicateField={onDuplicateField}
                />
                
                {/* Drop zone after each field */}
                {!isMobile && (
                  <div
                    onDragEnter={(e) => handleDragEnter(e, index + 1)}
                    onDrop={(e) => handleDrop(e, index + 1)}
                    className={`transition-all duration-200 ${
                      dragOverIndex === index + 1 && isDraggingFromPalette
                        ? 'h-16 border-2 border-dashed border-indigo-500 bg-indigo-50/50 rounded-xl flex items-center justify-center text-sm font-medium text-indigo-600'
                        : 'h-1 hover:h-12 hover:border-2 hover:border-dashed hover:border-slate-300 hover:bg-slate-50 rounded-lg'
                    }`}
                  >
                    {dragOverIndex === index + 1 && isDraggingFromPalette && (
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        Drop here to add field
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {form.fields.length === 0 && (
              <div 
                onDragEnter={(e) => handleDragEnter(e, 0)}
                onDrop={(e) => handleDrop(e, 0)}
                className={`text-center text-sm py-12 rounded-2xl transition-all ${
                  isDraggingFromPalette && !isMobile
                    ? 'border-2 border-dashed border-indigo-500 bg-indigo-50/50 text-indigo-600 font-medium'
                    : 'border-2 border-dashed border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isDraggingFromPalette && !isMobile ? (
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>Drop field here to add it to your form</span>
                  </div>
                ) : !isMobile ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-base">📋</span>
                    <span>Click or drag a field from the left to start building your form</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-base">📋</span>
                    <span>Click a field from the left to start building your form</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}
