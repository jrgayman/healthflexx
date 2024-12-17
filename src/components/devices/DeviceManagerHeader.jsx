import React from 'react';
import { Link } from 'react-router-dom';

export default function DeviceManagerHeader() {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <Link 
          to="/admin"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
      </div>
    </div>
  );
}