import React from 'react';
import { Link } from 'react-router-dom';

export default function PediatricAdherenceTable({ patients, onStartSession }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Sessions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adherence Rate</th>
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
                  <div className="text-sm text-gray-900">
                    {patient.active_sessions} active sessions
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.adherence_rate >= 80 ? 'bg-green-100 text-green-800' :
                    patient.adherence_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {patient.adherence_rate}%
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button
                    onClick={() => onStartSession(patient.id)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Start Session
                  </button>
                  <Link
                    to={`/admin/patient/${patient.id}/adherence`}
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