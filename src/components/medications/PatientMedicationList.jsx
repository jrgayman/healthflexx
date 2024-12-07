import React from 'react';

export default function PatientMedicationList({ medications }) {
  if (!medications?.length) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No medications assigned</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {medications.map((med) => (
              <tr key={med.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {med.medications?.brand_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {med.medications?.generic_name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{med.dosage}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{med.frequency}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(med.start_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {med.end_date ? new Date(med.end_date).toLocaleDateString() : 'Ongoing'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    med.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {med.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}