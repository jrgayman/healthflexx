import React from 'react';

export default function StaffStatusRadio({ status, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <label className={`
        relative flex items-center justify-center p-4 cursor-pointer
        border-2 rounded-lg transition-all
        ${status === 'Off Duty' 
          ? 'border-red-500 bg-red-50' 
          : 'border-gray-200 hover:border-red-200'}
      `}>
        <input
          type="radio"
          name="primaryStatus"
          value="Off Duty"
          checked={status === 'Off Duty'}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <div className="text-center">
          <div className={`text-2xl mb-2 ${status === 'Off Duty' ? 'text-red-500' : 'text-gray-400'}`}>
            ⭕
          </div>
          <span className={`font-medium ${status === 'Off Duty' ? 'text-red-700' : 'text-gray-600'}`}>
            Off Duty
          </span>
        </div>
        {status === 'Off Duty' && (
          <div className="absolute top-2 right-2">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </label>

      <label className={`
        relative flex items-center justify-center p-4 cursor-pointer
        border-2 rounded-lg transition-all
        ${status === 'Available' 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200 hover:border-green-200'}
      `}>
        <input
          type="radio"
          name="primaryStatus"
          value="Available"
          checked={status === 'Available'}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <div className="text-center">
          <div className={`text-2xl mb-2 ${status === 'Available' ? 'text-green-500' : 'text-gray-400'}`}>
            ✓
          </div>
          <span className={`font-medium ${status === 'Available' ? 'text-green-700' : 'text-gray-600'}`}>
            Available
          </span>
        </div>
        {status === 'Available' && (
          <div className="absolute top-2 right-2">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </label>
    </div>
  );
}