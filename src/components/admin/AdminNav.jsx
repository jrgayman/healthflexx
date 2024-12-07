import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminNav() {
  const [usersOpen, setUsersOpen] = useState(false);
  const [organizationsOpen, setOrganizationsOpen] = useState(false);
  const [medicationsOpen, setMedicationsOpen] = useState(false);
  const [incontinenceOpen, setIncontinenceOpen] = useState(false);
  const [telehealthOpen, setTelehealthOpen] = useState(false);

  const location = useLocation();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              HealthFlexx
            </Link>
            <div className="hidden md:flex items-center space-x-4 ml-8">
              <Link
                to="/admin/content"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin/content'
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
                    location.pathname.includes('/admin/users') ||
                    location.pathname.includes('/admin/patients') ||
                    location.pathname.includes('/admin/medical-staff')
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
                    location.pathname.includes('/admin/organizations') ||
                    location.pathname.includes('/admin/providers')
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
                    location.pathname.includes('/admin/medications') ||
                    location.pathname.includes('/admin/medication-adherence')
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
                    location.pathname.includes('/admin/incontinence') ||
                    location.pathname.includes('/admin/rfid')
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

              {/* Telehealth Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTelehealthOpen(!telehealthOpen)}
                  onBlur={() => setTimeout(() => setTelehealthOpen(false), 200)}
                  className={`px-3 py-2 rounded-md text-sm font-medium inline-flex items-center ${
                    location.pathname.includes('/admin/telehealth')
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Telehealth
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {telehealthOpen && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/admin/telehealth/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin
                      </Link>
                      <Link
                        to="/admin/telehealth/staff"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Staff
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/admin/devices"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin/devices'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Devices
              </Link>

              <Link
                to="/admin/apis"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/admin/apis'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                APIs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}