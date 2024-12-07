import React from 'react';
import { Link } from 'react-router-dom';

export default function Admin() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Telehealth Administration</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Telehealth administration features are currently under development. Check back soon for updates!
        </p>
      </div>
    </div>
  );
}