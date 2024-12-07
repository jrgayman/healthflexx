import React from 'react';

export default function PatientQueueItem({ patient }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-full"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
            alt=""
          />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{patient.name}</div>
            <div className="text-xs text-gray-500">MRN: {patient.medical_record_number}</div>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Wait: {patient.waitTime}
        </div>
      </div>
      
      <div className="mt-2 text-sm text-gray-600">
        {patient.reason}
      </div>
      
      <div className="mt-3 flex justify-end">
        <button className="px-3 py-1 text-sm text-primary hover:text-primary-dark rounded-md">
          Start Visit
        </button>
      </div>
    </div>
  );
}