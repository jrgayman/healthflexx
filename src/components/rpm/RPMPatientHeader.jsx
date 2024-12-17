import React from 'react';
import { Link } from 'react-router-dom';

export default function RPMPatientHeader({ patient }) {
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
          <div className="text-gray-600">
            <p>MRN: {patient.medical_record_number}</p>
            <p>Provider: {patient.healthcare_providers?.name || 'Unassigned'}</p>
            <p>Company: {patient.companies?.name || 'Unassigned'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Link
          to={`/admin/rpm/patients/${patient.id}/activity`}
          className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          <div className="text-lg font-medium text-gray-900">Activity</div>
        </Link>
        <Link
          to={`/admin/rpm/patients/${patient.id}/weight`}
          className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          <div className="text-lg font-medium text-gray-900">Weight</div>
        </Link>
        <Link
          to={`/admin/rpm/patients/${patient.id}/medications`}
          className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          <div className="text-lg font-medium text-gray-900">Medications</div>
        </Link>
        <Link
          to={`/admin/rpm/patients/${patient.id}/alerts`}
          className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100"
        >
          <div className="text-lg font-medium text-gray-900">Alerts</div>
        </Link>
      </div>
    </div>
  );
}