import React from 'react';

export default function StaffStatusSelector({ 
  primaryStatus, 
  onPrimaryStatusChange,
  secondaryStatus,
  onSecondaryStatusChange 
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-4">Primary Status</label>
        <div className="grid grid-cols-2 gap-4">
          <label className={`
            relative flex items-center justify-center p-4 cursor-pointer
            border-2 rounded-lg transition-all
            ${primaryStatus === 'Off Duty' 
              ? 'border-red-500 bg-red-50' 
              : 'border-gray-200 hover:border-red-200'}
          `}>
            <input
              type="radio"
              name="primaryStatus"
              value="Off Duty"
              checked={primaryStatus === 'Off Duty'}
              onChange={(e) => onPrimaryStatusChange(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className={`text-2xl mb-2 ${primaryStatus === 'Off Duty' ? 'text-red-500' : 'text-gray-400'}`}>
                ⭕
              </div>
              <span className={`font-medium ${primaryStatus === 'Off Duty' ? 'text-red-700' : 'text-gray-600'}`}>
                Off Duty
              </span>
            </div>
            {primaryStatus === 'Off Duty' && (
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
            ${primaryStatus === 'Available' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-200'}
          `}>
            <input
              type="radio"
              name="primaryStatus"
              value="Available"
              checked={primaryStatus === 'Available'}
              onChange={(e) => onPrimaryStatusChange(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className={`text-2xl mb-2 ${primaryStatus === 'Available' ? 'text-green-500' : 'text-gray-400'}`}>
                ✓
              </div>
              <span className={`font-medium ${primaryStatus === 'Available' ? 'text-green-700' : 'text-gray-600'}`}>
                Available
              </span>
            </div>
            {primaryStatus === 'Available' && (
              <div className="absolute top-2 right-2">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </label>
        </div>
      </div>

      {primaryStatus === 'Available' && (
        <div className="space-y-4">
          <label className="block text-lg font-medium text-gray-900 mb-4">Secondary Status</label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`
              relative flex items-center justify-center p-4 cursor-pointer
              border-2 rounded-lg transition-all
              ${secondaryStatus === 'Available not w/ Patient' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-200'}
            `}>
              <input
                type="radio"
                name="secondaryStatus"
                value="Available not w/ Patient"
                checked={secondaryStatus === 'Available not w/ Patient'}
                onChange={(e) => onSecondaryStatusChange(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className={`text-2xl mb-2 ${secondaryStatus === 'Available not w/ Patient' ? 'text-blue-500' : 'text-gray-400'}`}>
                  👋
                </div>
                <span className={`font-medium ${secondaryStatus === 'Available not w/ Patient' ? 'text-blue-700' : 'text-gray-600'}`}>
                  Available not w/ Patient
                </span>
              </div>
              {secondaryStatus === 'Available not w/ Patient' && (
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
              ${secondaryStatus === 'Available w/ Patient' 
                ? 'border-yellow-500 bg-yellow-50' 
                : 'border-gray-200 hover:border-yellow-200'}
            `}>
              <input
                type="radio"
                name="secondaryStatus"
                value="Available w/ Patient"
                checked={secondaryStatus === 'Available w/ Patient'}
                onChange={(e) => onSecondaryStatusChange(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className={`text-2xl mb-2 ${secondaryStatus === 'Available w/ Patient' ? 'text-yellow-500' : 'text-gray-400'}`}>
                  👥
                </div>
                <span className={`font-medium ${secondaryStatus === 'Available w/ Patient' ? 'text-yellow-700' : 'text-gray-600'}`}>
                  Available w/ Patient
                </span>
              </div>
              {secondaryStatus === 'Available w/ Patient' && (
                <div className="absolute top-2 right-2">
                  <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          </div>
        </div>
      )}
    </div>
  );
}