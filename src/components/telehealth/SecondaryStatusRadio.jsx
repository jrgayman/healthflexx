import React from 'react';

export default function SecondaryStatusRadio({ status, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <label className={`
        relative flex items-center justify-center p-4 cursor-pointer
        border-2 rounded-lg transition-all
        ${status === 'Available not w/ Patient' 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-blue-200'}
      `}>
        <input
          type="radio"
          name="secondaryStatus"
          value="Available not w/ Patient"
          checked={status === 'Available not w/ Patient'}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <div className="text-center">
          <div className={`text-2xl mb-2 ${status === 'Available not w/ Patient' ? 'text-blue-500' : 'text-gray-400'}`}>
            👋
          </div>
          <span className={`font-medium ${status === 'Available not w/ Patient' ? 'text-blue-700' : 'text-gray-600'}`}>
            Available not w/ Patient
          </span>
        </div>
        {status === 'Available not w/ Patient' && (
          <div className="absolute top-2 right-2">
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </label>

      <label className={`
        relative flex items-center justify-center p-4 cursor-pointer
        border-2 rounded-lg transition-all
        ${status === 'Available w/ Patient' 
          ? 'border-yellow-500 bg-yellow-50' 
          : 'border-gray-200 hover:border-yellow-200'}
      `}>
        <input
          type="radio"
          name="secondaryStatus"
          value="Available w/ Patient"
          checked={status === 'Available w/ Patient'}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <div className="text-center">
          <div className={`text-2xl mb-2 ${status === 'Available w/ Patient' ? 'text-yellow-500' : 'text-gray-400'}`}>
            👥
          </div>
          <span className={`font-medium ${status === 'Available w/ Patient' ? 'text-yellow-700' : 'text-gray-600'}`}>
            Available w/ Patient
          </span>
        </div>
        {status === 'Available w/ Patient' && (
          <div className="absolute top-2 right-2">
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </label>
    </div>
  );
}