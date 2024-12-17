import React from 'react';
import { Link } from 'react-router-dom';

export default function BlankLanding() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <section className="bg-white rounded-lg shadow-md p-8 text-center">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to HealthFlexx Admin</h1>
          <p className="text-gray-600 mb-8">
            Please select a section from the navigation menu above to get started.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Link to Patients Section */}
          <Link
            to="/admin/patients"
            className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 focus-visible:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Patients</h2>
            <p className="text-sm text-gray-600">Manage patient records and care</p>
          </Link>

          {/* Link to Medical Staff Section */}
          <Link
            to="/admin/medical-staff"
            className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 focus-visible:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Medical Staff</h2>
            <p className="text-sm text-gray-600">View and manage medical staff</p>
          </Link>

          {/* Link to Devices Section */}
          <Link
            to="/admin/devices"
            className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 focus-visible:bg-gray-100 transition-colors"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Devices</h2>
            <p className="text-sm text-gray-600">Manage medical devices</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
