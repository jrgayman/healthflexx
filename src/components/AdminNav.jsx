import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUser, logout } from '../lib/auth';

export default function AdminNav() {
  const location = useLocation();
  const user = getUser();
  const [usersOpen, setUsersOpen] = React.useState(false);
  const [organizationsOpen, setOrganizationsOpen] = React.useState(false);
  const [medicationsOpen, setMedicationsOpen] = React.useState(false);
  const [incontinenceOpen, setIncontinenceOpen] = React.useState(false);

  const isActive = (path) => location.pathname.includes(path);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-primary">
              HealthFlexx
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/admin/content"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/admin/content')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Content
              </Link>

              {/* Users Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUsersOpen(!usersOpen)}
                  onBlur={() => setTimeout(() => setUsersOpen(false), 200)}
                  className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center ${
                    isActive('/admin/users') || isActive('/admin/patients') || isActive('/admin/medical-staff')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Users
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {usersOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Users
                      </Link>
                      <Link
                        to="/admin/patients"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Patients
                      </Link>
                      <Link
                        to="/admin/medical-staff"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Medical Staff
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Organizations Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOrganizationsOpen(!organizationsOpen)}
                  onBlur={() => setTimeout(() => setOrganizationsOpen(false), 200)}
                  className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center ${
                    isActive('/admin/organizations') || isActive('/admin/providers')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Organizations
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {organizationsOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/organizations"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Organizations
                      </Link>
                      <Link
                        to="/admin/providers"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Providers
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Medications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMedicationsOpen(!medicationsOpen)}
                  onBlur={() => setTimeout(() => setMedicationsOpen(false), 200)}
                  className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center ${
                    isActive('/admin/medications') || isActive('/admin/medication-adherence')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Medications
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {medicationsOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/medications"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Medications
                      </Link>
                      <Link
                        to="/admin/medication-adherence"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Medication Adherence
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Incontinence Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIncontinenceOpen(!incontinenceOpen)}
                  onBlur={() => setTimeout(() => setIncontinenceOpen(false), 200)}
                  className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center ${
                    isActive('/admin/incontinence') || isActive('/admin/rfid')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Incontinence
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {incontinenceOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/incontinence"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Incontinence Manager
                      </Link>
                      <Link
                        to="/admin/rfid"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        RFID Manager
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/admin/devices"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/admin/devices')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Devices
              </Link>

              <Link
                to="/admin/apis"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/admin/apis')
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                APIs
              </Link>
            </div>
          </div>

          {/* User Menu */}
          {user && (
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-700 hover:text-primary"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}