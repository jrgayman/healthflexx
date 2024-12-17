import React, { useState } from 'react';

export default function AddReadingModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title,
  unit = '',
  placeholder = ''
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(parseFloat(value));
    setValue('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Add {title} Reading</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {title} {unit && `(${unit})`}
            </label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
            >
              Add Reading
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}