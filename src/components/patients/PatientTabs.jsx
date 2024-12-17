import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PatientTabs({ patientId }) {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const tabs = [
    { id: 'vitals', label: 'Vitals' },
    { id: 'activity', label: 'Activity' },
    { id: 'weight', label: 'Weight' },
    { id: 'adherence', label: 'Medication Adherence' },
    { id: 'devices', label: 'Devices' },
    { id: 'contacts', label: 'Contacts' }
  ];

  const getTabClasses = (tabId) => {
    const baseClasses = 'px-4 py-2 border-b-2 font-medium text-sm';
    const activeClasses = 'border-primary text-primary';
    const inactiveClasses = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    
    return `${baseClasses} ${currentPath === tabId ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
      {tabs.map(tab => (
        <Link
          key={tab.id}
          to={`/admin/patient/${patientId}/${tab.id}`}
          className={getTabClasses(tab.id)}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}