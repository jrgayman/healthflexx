import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function PatientQueueCard({ patient }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <img
            src={patient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
            alt=""
            className="h-12 w-12 rounded-full mr-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`;
            }}
          />
          <div>
            <h3 className="font-medium text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-500">MRN: {patient.mrn}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            Waiting: {formatDistanceToNow(new Date(patient.joinedAt))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700">Chief Concern:</div>
        <div className="text-sm text-gray-600 mt-1">{patient.concern}</div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => window.open('https://healthflexxinc.com/mymeetings', '_blank')}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm"
        >
          Join Video Room
        </button>
        <button
          onClick={patient.onQuickChat}
          className="text-primary hover:text-primary-dark text-sm font-medium"
        >
          Quick Chat
        </button>
      </div>
    </div>
  );
}