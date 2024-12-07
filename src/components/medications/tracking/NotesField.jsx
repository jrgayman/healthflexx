import React from 'react';

export default function NotesField({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Notes</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        maxLength={500}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        placeholder="Add any notes about this dose..."
      />
      <p className="mt-1 text-sm text-gray-500">
        {value.length}/500 characters
      </p>
    </div>
  );
}