import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function DeviceManagerTabs() {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  const tabs = [
    { id: 'products', label: 'Products' },
    { id: 'models', label: 'Models' },
    { id: 'categories', label: 'Categories' }
  ];

  return (
    <div className="flex border-b border-gray-200 mb-8">
      {tabs.map(tab => (
        <Link
          key={tab.id}
          to={`/admin/devices/${tab.id}`}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            currentPath === tab.id
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