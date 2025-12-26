"use client";
export default function FieldSettingsPanel({ field, fields = [], onChange }) {
  if (!field)
    return (
      <aside className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 text-sm text-slate-600 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl mb-2">⚙️</div>
          <div>Select a field to customize its settings</div>
        </div>
      </aside>
    );

  return (
    <aside className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 space-y-3 text-sm h-full overflow-y-auto">
      <div>
        <div className="text-xs text-slate-600 uppercase mb-1">Label</div>
        <input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <div className="text-xs text-slate-600 uppercase mb-1">Placeholder</div>
        <input
          value={field.placeholder || ''}
          onChange={(e) => onChange({ placeholder: e.target.value })}
          className="input"
        />
      </div>

      <div className="flex items-center justify-between">
        <span>Required</span>
        <button
          onClick={() => onChange({ required: !field.required })}
          className={`w-10 h-5 rounded-full text-[10px] flex items-center px-1 ${
            field.required ? 'bg-emerald-500' : 'bg-slate-200'
          }`}
        >
          <span
            className={`h-4 w-4 bg-white rounded-full shadow transition-transform ${
              field.required ? 'translate-x-4' : 'translate-x-0'
            }`}
          ></span>
        </button>
      </div>

      {['dropdown','radio','checkbox'].includes(field.type) && (
        <div>
          <div className="text-xs text-slate-600 uppercase mb-1">Options (one per line)</div>
          <textarea
            value={field.options?.join('\n') || ''}
            onChange={(e) => {
              const text = e.target.value;
              // Don't filter while typing - preserve the exact textarea content
              const optionsArray = text.split('\n');
              onChange({ options: optionsArray });
            }}
            onBlur={(e) => {
              // Clean up empty lines only on blur
              const text = e.target.value;
              const optionsArray = text
                .split('\n')
                .map((o) => o.trim())
                .filter((o) => o.length > 0);
              onChange({ options: optionsArray });
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
              }
            }}
            rows={4}
            className="input w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm whitespace-pre-wrap resize-none"
            style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
          />
          <div className="text-xs text-slate-500 mt-2 space-y-1">
            <div>💡 Press Enter after each option</div>
            <div>✓ Current: {field.options?.filter(o => o.trim().length > 0).length || 0} option(s)</div>
            <div className="mt-1 p-2 bg-blue-50 rounded text-xs">
              {field.options && field.options.filter(o => o.trim().length > 0).length > 0 ? (
                <div>Added: {field.options.filter(o => o.trim().length > 0).map((opt, i) => (<div key={i}>• {opt}</div>))}</div>
              ) : (
                <div>Start typing to add options...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image upload for image_choice field */}
      {field.type === 'image_choice' && (
        <div>
          <div className="text-xs text-slate-600 uppercase mb-1">Image Options</div>
          {(field.options || []).map((opt, idx) => (
            <div key={idx} className="flex items-center gap-4 mb-2">
              <input
                type="text"
                value={opt.label || ''}
                onChange={e => {
                  const newOptions = [...field.options];
                  newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                  onChange({ options: newOptions });
                }}
                placeholder={`Option ${idx + 1} label`}
                className="input flex-1"
              />
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new window.FileReader();
                  reader.onloadend = () => {
                    const newOptions = [...field.options];
                    newOptions[idx] = { ...newOptions[idx], url: reader.result };
                    onChange({ options: newOptions });
                  };
                  reader.readAsDataURL(file);
                }}
                className="input"
              />
              {opt.url && (
                <img src={opt.url} alt="preview" className="w-12 h-12 object-cover rounded border" />
              )}
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 text-xs"
            onClick={() => {
              const newOptions = [...(field.options || []), { label: '', url: '' }];
              onChange({ options: newOptions });
            }}
          >
            + Add Option
          </button>
        </div>
      )}

      {field.type === 'matrix' && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <div className="text-xs text-slate-600 uppercase mb-2">Matrix Settings</div>
          
          <div>
            <div className="text-xs text-slate-500 mb-1">Rows (one per line)</div>
            <textarea
              value={field.matrixRows?.join('\n') || ''}
              onChange={(e) => {
                const text = e.target.value;
                // Don't filter while typing - preserve the exact textarea content
                const rowsArray = text.split('\n');
                onChange({ matrixRows: rowsArray });
              }}
              onBlur={(e) => {
                // Clean up empty lines only on blur
                const text = e.target.value;
                const rowsArray = text
                  .split('\n')
                  .map((r) => r.trim())
                  .filter((r) => r.length > 0);
                onChange({ matrixRows: rowsArray });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              rows={4}
              className="input w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm whitespace-pre-wrap resize-none"
              style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
            />
            <div className="text-xs text-slate-500 mt-1">
              💡 Press Enter after each row. Current: {field.matrixRows?.filter(r => r.trim().length > 0).length || 0} row(s)
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">Columns (one per line)</div>
            <textarea
              value={field.matrixColumns?.join('\n') || ''}
              onChange={(e) => {
                const text = e.target.value;
                // Don't filter while typing - preserve the exact textarea content
                const columnsArray = text.split('\n');
                onChange({ matrixColumns: columnsArray });
              }}
              onBlur={(e) => {
                // Clean up empty lines only on blur
                const text = e.target.value;
                const columnsArray = text
                  .split('\n')
                  .map((c) => c.trim())
                  .filter((c) => c.length > 0);
                onChange({ matrixColumns: columnsArray });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              rows={4}
              className="input w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm whitespace-pre-wrap resize-none"
              style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
            />
            <div className="text-xs text-slate-500 mt-1">
              💡 Press Enter after each column. Current: {field.matrixColumns?.filter(c => c.trim().length > 0).length || 0} column(s)
            </div>
          </div>
        </div>
      )}

      {field.type === 'file' && (
        <div className="space-y-2 border-t border-slate-200 pt-3">
          <div className="text-xs text-slate-600 uppercase mb-2">File Upload Settings</div>
          
          <div>
            <div className="text-xs text-slate-500 mb-1">Allowed file types</div>
            <input
              value={field.fileTypes || '.pdf,.doc,.docx,.jpg,.png'}
              onChange={(e) => onChange({ fileTypes: e.target.value })}
              placeholder=".pdf,.jpg,.png"
              className="input"
            />
          </div>

          <div>
            <div className="text-xs text-slate-500 mb-1">Max file size (MB)</div>
            <input
              type="number"
              value={field.maxFileSize || 5}
              onChange={(e) => onChange({ maxFileSize: parseInt(e.target.value) || 5 })}
              min="1"
              max="100"
              className="input"
            />
          </div>
        </div>
      )}

      {/* Validation Rules Section */}
      <div className="space-y-2 border-t border-slate-200 pt-3">
        <div className="text-xs text-slate-600 uppercase mb-2">Validation Rules</div>

        {['short_text', 'long_text', 'email', 'number', 'date', 'phone'].includes(field.type) && (
          <>
            {['short_text', 'long_text'].includes(field.type) && (
              <>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Min Length</div>
                  <input
                    type="number"
                    value={field.validation?.minLength || ''}
                    onChange={(e) => onChange({ validation: { ...(field.validation||{}), minLength: e.target.value ? parseInt(e.target.value) : undefined } })}
                    placeholder="e.g., 5"
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Max Length</div>
                  <input
                    type="number"
                    value={field.validation?.maxLength || ''}
                    onChange={(e) => onChange({ validation: { ...(field.validation||{}), maxLength: e.target.value ? parseInt(e.target.value) : undefined } })}
                    placeholder="e.g., 100"
                    className="input"
                    min="0"
                  />
                </div>
              </>
            )}

            {['number', 'date'].includes(field.type) && (
              <>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Min Value</div>
                  <input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={(e) => onChange({ validation: { ...(field.validation||{}), min: e.target.value ? parseInt(e.target.value) : undefined } })}
                    placeholder={field.type === 'number' ? 'e.g., 1' : 'e.g., 2025-01-01'}
                    className="input"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Max Value</div>
                  <input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={(e) => onChange({ validation: { ...(field.validation||{}), max: e.target.value ? parseInt(e.target.value) : undefined } })}
                    placeholder={field.type === 'number' ? 'e.g., 100' : 'e.g., 2025-12-31'}
                    className="input"
                  />
                </div>
              </>
            )}

            <div>
              <div className="text-xs text-slate-500 mb-1">Regex Pattern (optional)</div>
              <input
                value={field.validation?.pattern || ''}
                onChange={(e) => onChange({ validation: { ...(field.validation||{}), pattern: e.target.value } })}
                placeholder="e.g., ^[A-Z][a-z]*$"
                className="input text-xs"
              />
            </div>

            {field.validation?.pattern && (
              <div>
                <div className="text-xs text-slate-500 mb-1">Pattern Error Message</div>
                <input
                  value={field.validation?.patternErrorMessage || ''}
                  onChange={(e) => onChange({ validation: { ...(field.validation||{}), patternErrorMessage: e.target.value } })}
                  placeholder="Please enter valid format"
                  className="input"
                />
              </div>
            )}

            <div>
              <div className="text-xs text-slate-500 mb-1">Required Error Message</div>
              <input
                value={field.validation?.customMessage || ''}
                onChange={(e) => onChange({ validation: { ...(field.validation||{}), customMessage: e.target.value } })}
                placeholder={`This field is required`}
                className="input"
              />
            </div>
          </>
        )}

        {!['short_text', 'long_text', 'email', 'number', 'date', 'phone'].includes(field.type) && (
          <div className="text-xs text-slate-500 italic">Validation rules available for text, number, and date fields.</div>
        )}
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-3">
        <div>
          <div className="text-xs text-slate-600 uppercase mb-2 font-semibold">Conditional Logic</div>
          <p className="text-xs text-slate-500 mb-3">Show this field only when specific conditions are met.</p>

          {!field.logic?.showWhenFieldId ? (
            <button
              onClick={() => onChange({ logic: { showWhenFieldId: '', operator: 'equals', value: '' } })}
              className="w-full px-3 py-2 rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-700 transition-all"
            >
              + Add Condition
            </button>
          ) : (
            <div className="bg-blue-50 rounded-lg p-3 space-y-2 border border-blue-200">
              <div>
                <div className="text-xs font-medium text-slate-700 mb-1">When field:</div>
                <select 
                  value={field.logic?.showWhenFieldId || ''} 
                  onChange={(e) => onChange({ logic: { ...(field.logic||{}), showWhenFieldId: e.target.value } })} 
                  className="w-full input text-sm"
                >
                  <option value="">-- Select field --</option>
                  {fields.filter(f => f._id !== field._id).map(f => (
                    <option key={f._id} value={f._id}>{f.label || f.type}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-700 mb-1">Condition:</div>
                <select 
                  value={field.logic?.operator || 'equals'} 
                  onChange={(e) => onChange({ logic: { ...(field.logic||{}), operator: e.target.value } })} 
                  className="w-full input text-sm"
                >
                  <option value="equals">equals</option>
                  <option value="not_equals">does not equal</option>
                  <option value="contains">contains</option>
                </select>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-700 mb-1">Value:</div>
                <input 
                  value={field.logic?.value || ''} 
                  onChange={(e) => onChange({ logic: { ...(field.logic||{}), value: e.target.value } })} 
                  placeholder="Enter value to match" 
                  className="w-full input text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={() => onChange({ logic: null })} 
                  className="flex-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-all"
                >
                  Remove
                </button>
              </div>

              {field.logic?.showWhenFieldId && (
                <div className="text-xs bg-white rounded px-2 py-1 text-slate-600 mt-2 border border-blue-100">
                  📋 This field will show when <strong>{fields.find(f => f._id === field.logic.showWhenFieldId)?.label}</strong> {field.logic?.operator === 'equals' ? 'is' : field.logic?.operator === 'not_equals' ? 'is not' : 'contains'} "<strong>{field.logic?.value}</strong>"
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
