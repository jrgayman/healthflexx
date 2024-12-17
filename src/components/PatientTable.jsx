import React from 'react';
import { Link } from 'react-router-dom';

export default function PatientTable({ patients }) {
  if (!patients?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={patient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
                      alt=""
                      className="h-10 w-10 rounded-full mr-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`;
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">MRN: {patient.medical_record_number}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{patient.email}</div>
                  <div className="text-sm text-gray-500">{patient.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {patient.healthcare_providers?.name || 'Unassigned'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {patient.companies?.name || 'Unassigned'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/admin/patient/${patient.id}`}
                    className="text-primary hover:text-primary-dark"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}