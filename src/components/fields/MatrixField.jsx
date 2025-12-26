// frontend/custom-form-next/src/components/fields/MatrixField.jsx
import { useEffect, useState } from 'react';

export default function MatrixField({ field, value, onChange }) {
  const [selectedCells, setSelectedCells] = useState(value || {});

  useEffect(() => {
    setSelectedCells(value || {});
  }, [value]);

  const handleCellChange = (row, col) => {
    const key = `${row}-${col}`;
    const newValue = { ...selectedCells, [key]: !selectedCells[key] };
    setSelectedCells(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-900">{field.label}</label>
      <div className="overflow-x-auto border border-slate-300 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700"></th>
              {(field.matrixColumns || []).map((col, i) => (
                <th key={i} className="px-3 py-2 text-center font-semibold text-slate-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(field.matrixRows || []).map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="px-3 py-2 font-medium text-slate-900">{row}</td>
                {(field.matrixColumns || []).map((col, colIdx) => (
                  <td key={colIdx} className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCells[`${rowIdx}-${colIdx}`] || false}
                      onChange={() => handleCellChange(rowIdx, colIdx)}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {field.required && !Object.values(selectedCells).some((v) => v) && (
        <p className="text-sm text-red-500">This field is required</p>
      )}
    </div>
  );
}
