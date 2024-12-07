import React from 'react';

export default function StatusMenu({ position, onSelect, onClose }) {
  const statusOptions = [
    { value: 'taken', label: 'Taken', color: 'bg-green-500' },
    { value: 'missed', label: 'Missed', color: 'bg-red-500' },
    { value: 'late', label: 'Late', color: 'bg-yellow-500' },
    { value: 'overtaken', label: 'Overtaken', color: 'bg-orange-500' },
    { value: 'pending', label: 'Pending', color: 'bg-gray-200' }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div 
        className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 w-40"
        style={{
          top: position.top,
          left: position.left
        }}
      >
        <div className="py-1">
          {statusOptions.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                onSelect(value);
                onClose();
              }}
              className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 capitalize"
            >
              <span className={`inline-block w-3 h-3 rounded-full ${color} mr-2`}></span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}