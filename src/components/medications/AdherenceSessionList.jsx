import React from 'react';
import { Link } from 'react-router-dom';

export default function AdherenceSessionList({ sessions }) {
  if (!sessions?.length) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No active tracking sessions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adherence Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session.session_id}>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {new Date(session.start_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    session.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.active ? 'Active' : 'Completed'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {session.adherence_rate}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/admin/patient/${session.patient_id}/medication/${session.session_id}/current`}
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