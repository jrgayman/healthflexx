import React from 'react';
import NotificationPreferences from './NotificationPreferences';
import FamilyContacts from './FamilyContacts';

export default function PatientHeader({ patient }) {
  if (!patient) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={patient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
          alt=""
          className="h-16 w-16 rounded-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`;
          }}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-gray-600">
            MRN: {patient.medical_record_number} | Provider: {patient.healthcare_providers?.name || 'Unassigned'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <NotificationPreferences patientId={patient.id} />
        <FamilyContacts patientId={patient.id} />
      </div>
    </div>
  );
}