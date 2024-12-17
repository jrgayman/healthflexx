import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function RPMTabs({ patientId }) {
  const location = useLocation();

  const tabs = [
    { id: 'activity', label: 'Activity' },
    { id: 'weight', label: 'Weight' },
    { id: 'medications', label: 'Medications' },
    { id: 'alerts', label: 'Alerts' }
  ];

  return (
    <div className="flex border-b border-gray-200 mb-8">
      {tabs.map(tab => (
        <Link
          key={tab.id}
          to={`/admin/rpm/patients/${patientId}/${tab.id}`}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            location.pathname.includes(tab.id)
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}