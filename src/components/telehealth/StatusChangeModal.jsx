import React, { useState, useEffect } from 'react';
import StaffStatusRadio from './StaffStatusRadio';
import SecondaryStatusRadio from './SecondaryStatusRadio';

export default function StatusChangeModal({ isOpen, onClose, onStatusChange, currentStatus }) {
  const [primaryStatus, setPrimaryStatus] = useState(currentStatus?.primary || 'Off Duty');
  const [secondaryStatus, setSecondaryStatus] = useState(currentStatus?.secondary || '');

  useEffect(() => {
    if (isOpen) {
      setPrimaryStatus(currentStatus?.primary || 'Off Duty');
      setSecondaryStatus(currentStatus?.secondary || '');
    }
  }, [isOpen, currentStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onStatusChange({ primary: primaryStatus, secondary: secondaryStatus });
        }} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-900 mb-4">Primary Status</label>
            <StaffStatusRadio 
              status={primaryStatus}
              onChange={setPrimaryStatus}
            />
          </div>

          {primaryStatus === 'Available' && (
            <div>
              <label className="block text-lg font-medium text-gray-900 mb-4">Secondary Status</label>
              <SecondaryStatusRadio 
                status={secondaryStatus}
                onChange={setSecondaryStatus}
              />
            </div>
          )}

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
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}