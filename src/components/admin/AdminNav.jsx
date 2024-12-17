import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminNav() {
  const location = useLocation();
  const [adminsOpen, setAdminsOpen] = useState(false);
  const [dashboardsOpen, setDashboardsOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [rpmOpen, setRpmOpen] = useState(false);

  const getNavClasses = (paths) => {
    const isActive = paths.some(path => location.pathname.includes(path));
    return `px-3 py-2 rounded-md text-sm font-medium inline-flex items-center ${
      isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              HealthFlexx Admin
            </Link>
            <div className="hidden md:flex items-center space-x-4 ml-8">
              {/* Admins Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAdminsOpen(!adminsOpen)}
                  onBlur={() => setTimeout(() => setAdminsOpen(false), 200)}
                  className={getNavClasses(['/admin/users', '/admin/medications', '/admin/companies', '/admin/providers', '/admin/family-contacts', '/admin/apis'])}
                >
                  Admins
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {adminsOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Users
                      </Link>
                      <Link
                        to="/admin/medications"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Medications
                      </Link>
                      <Link
                        to="/admin/companies"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Companies
                      </Link>
                      <Link
                        to="/admin/providers"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Providers
                      </Link>
                      <Link
                        to="/admin/family-contacts"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Family Contacts
                      </Link>
                      <Link
                        to="/admin/apis"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        APIs
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboards Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDashboardsOpen(!dashboardsOpen)}
                  onBlur={() => setTimeout(() => setDashboardsOpen(false), 200)}
                  className={getNavClasses(['/admin/dashboards'])}
                >
                  Dashboards
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {dashboardsOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/dashboards/patients"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Patients
                      </Link>
                      <Link
                        to="/admin/dashboards/medical-staff"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Medical Staff
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Devices Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDevicesOpen(!devicesOpen)}
                  onBlur={() => setTimeout(() => setDevicesOpen(false), 200)}
                  className={getNavClasses(['/admin/devices'])}
                >
                  Devices
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {devicesOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/devices/products"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Products
                      </Link>
                      <Link
                        to="/admin/devices/models"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Models
                      </Link>
                      <Link
                        to="/admin/devices/categories"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Categories
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* RPM Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRpmOpen(!rpmOpen)}
                  onBlur={() => setTimeout(() => setRpmOpen(false), 200)}
                  className={getNavClasses(['/admin/rpm'])}
                >
                  RPM
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {rpmOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/rpm/vitals"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Vitals
                      </Link>
                      <Link
                        to="/admin/rpm/activity"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Activity
                      </Link>
                      <Link
                        to="/admin/rpm/weight"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Weight
                      </Link>
                      <Link
                        to="/admin/rpm/MedicationAdherence"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Medication Adherence
                      </Link>
                      <Link
                        to="/admin/rpm/alerts"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Alerts
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Incontinence Link */}
              <Link
                to="/admin/incontinence"
                className={getNavClasses(['/admin/incontinence'])}
              >
                Incontinence
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}