import React from 'react';

export default function PatientHeader({ patient }) {
  const avatarUrl = patient.avatar_url || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={avatarUrl}
          alt=""
          className="h-16 w-16 rounded-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`;
          }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd" />
              </svg>
              {patient.timezone || 'America/New_York'}
            </div>
          </div>
          <div className="text-gray-600">
            <p>MRN: {patient.medical_record_number}</p>
            <p>Provider: {patient.healthcare_providers?.name || 'Unassigned'}</p>
            <div className="flex items-center gap-4 mt-1">
              {patient.email && (
                <span className="text-sm">{patient.email}</span>
              )}
              {patient.phone && (
                <span className="text-sm">{patient.phone}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}