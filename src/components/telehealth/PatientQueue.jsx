import React from 'react';
import PatientQueueCard from './PatientQueueCard';

export default function PatientQueue({ patients }) {
  if (!patients?.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          No patients in queue
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Patient Queue ({patients.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <PatientQueueCard
            key={patient.id}
            patient={patient}
          />
        ))}
      </div>
    </div>
  );
}