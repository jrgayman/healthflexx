import React from 'react';
import { Link } from 'react-router-dom';

export default function MedicationAdherenceTable({ patients, onTakeMedication }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medications</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current View</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">History</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.map((patient) => (
              patient.schedules?.map((schedule, index) => (
                <tr key={`${patient.id}-${schedule.schedule_id}`}>
                  {index === 0 && (
                    <td className="px-6 py-4" rowSpan={patient.schedules?.length || 1}>
                      <div className="flex items-center">
                        <img
                          src={patient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=random`}
                          alt=""
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">MRN: {patient.medical_record_number}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {schedule.brand_name?.brand_name || schedule.brand_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {schedule.generic_name?.generic_name || schedule.generic_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {schedule.frequency_name?.name || schedule.frequency_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Array.isArray(schedule.time_slots) 
                        ? schedule.time_slots.join(', ')
                        : schedule.time_slots?.time_slot
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/patient/${patient.id}/medication/${schedule.schedule_id}/current`}
                      className="text-primary hover:text-primary-dark"
                    >
                      View Current
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/patient/${patient.id}/medication/${schedule.schedule_id}/history`}
                      className="text-primary hover:text-primary-dark"
                    >
                      View History
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onTakeMedication(patient.id, schedule.schedule_id)}
                      className="text-primary hover:text-primary-dark"
                    >
                      + Take Medication
                    </button>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}