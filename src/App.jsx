import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load admin pages
const UserManager = React.lazy(() => import('./pages/admin/UserManager'));
const Medications = React.lazy(() => import('./pages/admin/Medications'));
const Companies = React.lazy(() => import('./pages/admin/Organizations'));
const Providers = React.lazy(() => import('./pages/admin/Providers'));
const Patients = React.lazy(() => import('./pages/admin/dashboards/Patients'));
const MedicalStaff = React.lazy(() => import('./pages/admin/dashboards/MedicalStaff'));
const APIs = React.lazy(() => import('./pages/admin/APIs'));

// Device Management Pages
const DeviceManager = React.lazy(() => import('./pages/admin/devices'));
const ProductManager = React.lazy(() => import('./pages/admin/devices/ProductManager'));
const ModelManager = React.lazy(() => import('./pages/admin/devices/ModelManager'));
const CategoryManager = React.lazy(() => import('./pages/admin/devices/CategoryManager'));

// Patient Detail Pages
const PatientDetail = React.lazy(() => import('./pages/admin/patient/PatientDetail'));
const PatientVitals = React.lazy(() => import('./components/patients/PatientVitals'));
const PatientActivity = React.lazy(() => import('./components/patients/PatientActivity'));
const PatientWeight = React.lazy(() => import('./components/patients/PatientWeight'));
const PatientMedications = React.lazy(() => import('./components/patients/PatientMedications'));
const PatientDevices = React.lazy(() => import('./components/patients/PatientDevices'));
const PatientAdherence = React.lazy(() => import('./pages/admin/patient/PatientAdherence'));
const PatientContacts = React.lazy(() => import('./components/patients/PatientContacts'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <LoadingSpinner message="Loading..." />
  </div>
);

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboards/patients" replace />} />

        <Route path="/admin" element={<AdminLayout />}>
          {/* Admin Management routes */}
          <Route path="users" element={
            <Suspense fallback={<LoadingFallback />}>
              <UserManager />
            </Suspense>
          } />
          <Route path="medications" element={
            <Suspense fallback={<LoadingFallback />}>
              <Medications />
            </Suspense>
          } />
          <Route path="companies" element={
            <Suspense fallback={<LoadingFallback />}>
              <Companies />
            </Suspense>
          } />
          <Route path="providers" element={
            <Suspense fallback={<LoadingFallback />}>
              <Providers />
            </Suspense>
          } />

          {/* Dashboard routes */}
          <Route path="dashboards">
            <Route path="patients" element={
              <Suspense fallback={<LoadingFallback />}>
                <Patients />
              </Suspense>
            } />
            <Route path="medical-staff" element={
              <Suspense fallback={<LoadingFallback />}>
                <MedicalStaff />
              </Suspense>
            } />
          </Route>

          {/* Device Management routes */}
          <Route path="devices" element={
            <Suspense fallback={<LoadingFallback />}>
              <DeviceManager />
            </Suspense>
          }>
            <Route path="products" element={<ProductManager />} />
            <Route path="models" element={<ModelManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route index element={<Navigate to="products" replace />} />
          </Route>

          {/* Patient Detail routes */}
          <Route path="patient/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <PatientDetail />
            </Suspense>
          }>
            <Route path="vitals" element={<PatientVitals />} />
            <Route path="activity" element={<PatientActivity />} />
            <Route path="weight" element={<PatientWeight />} />
            <Route path="medications" element={<PatientMedications />} />
            <Route path="devices" element={<PatientDevices />} />
            <Route path="adherence" element={<PatientAdherence />} />
            <Route path="contacts" element={<PatientContacts />} />
            <Route index element={<Navigate to="vitals" replace />} />
          </Route>

          <Route path="apis" element={
            <Suspense fallback={<LoadingFallback />}>
              <APIs />
            </Suspense>
          } />

          <Route index element={<Navigate to="/admin/dashboards/patients" replace />} />
        </Route>
      </Routes>
    </div>
  );
}