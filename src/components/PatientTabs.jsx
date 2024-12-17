import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PatientTabs({ patientId }) {
  const location = useLocation();

  const tabs = [
    { id: 'vitals', label: 'Vitals' },
    { id: 'adherence', label: 'Medication Adherence' },
    { id: 'activity', label: 'Activity Management' },
    { id: 'weight', label: 'Weight Management' },
    { id: 'devices', label: 'Devices' },
    { id: 'staff', label: 'Staff' },
    { id: 'contacts', label: 'Contacts' }
  ];

  return (
    <div className="flex gap-4 mb-6 overflow-x-auto">
      {tabs.map(tab => (
        <Link
          key={tab.id}
          to={`/admin/patient/${patientId}/${tab.id}`}
          className={`px-4 py-2 rounded-lg whitespace-nowrap ${
            location.pathname.includes(`/${tab.id}`)
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}