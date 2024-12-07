import React from 'react';

export default function StatusSelect({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Status</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
      >
        <option value="taken">Taken</option>
        <option value="missed">Missed</option>
        <option value="late">Late</option>
        <option value="overtaken">Overtaken</option>
        <option value="pending">Pending</option>
      </select>
    </div>
  );
}