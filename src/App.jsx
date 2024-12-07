import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner';

// Eagerly load critical components
import Navigation from './components/layout/Navigation';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import AdminLayout from './layouts/AdminLayout';

// Lazy load admin pages
const ContentManager = lazy(() => import('./pages/admin/ContentManager'));
const UserManager = lazy(() => import('./pages/admin/UserManager'));
const Organizations = lazy(() => import('./pages/admin/Organizations'));
const DeviceManager = lazy(() => import('./pages/admin/DeviceManager'));
const APIs = lazy(() => import('./pages/admin/APIs'));
const Patients = lazy(() => import('./pages/admin/Patients'));
const Patient = lazy(() => import('./pages/admin/Patient'));
const PatientRFID = lazy(() => import('./pages/admin/PatientRFID'));
const PatientAdherence = lazy(() => import('./pages/admin/PatientAdherence'));
const MedicationAdherence = lazy(() => import('./pages/admin/MedicationAdherence'));
const PediatricAdherence = lazy(() => import('./pages/admin/PediatricAdherence'));
const Providers = lazy(() => import('./pages/admin/Providers'));
const MedicalStaff = lazy(() => import('./pages/admin/MedicalStaff'));
const Medications = lazy(() => import('./pages/admin/Medications'));
const Incontinence = lazy(() => import('./pages/admin/Incontinence'));
const RFIDManager = lazy(() => import('./pages/admin/RFIDManager'));
const TelehealthAdmin = lazy(() => import('./pages/admin/telehealth/Admin'));
const TelehealthStaff = lazy(() => import('./pages/admin/telehealth/Staff'));

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/blog/:category" element={<Category />} />
        <Route path="/blog/:category/:slug" element={<Article />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="content" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ContentManager />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<LoadingSpinner />}>
              <UserManager />
            </Suspense>
          } />
          <Route path="providers" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Providers />
            </Suspense>
          } />
          <Route path="organizations" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Organizations />
            </Suspense>
          } />
          <Route path="patients" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Patients />
            </Suspense>
          } />
          <Route path="patient/:id" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Patient />
            </Suspense>
          } />
          <Route path="patient/:id/rfid" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PatientRFID />
            </Suspense>
          } />
          <Route path="patient/:id/adherence" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PatientAdherence />
            </Suspense>
          } />
          <Route path="medication-adherence" element={
            <Suspense fallback={<LoadingSpinner />}>
              <MedicationAdherence />
            </Suspense>
          } />
          <Route path="pediatric-adherence" element={
            <Suspense fallback={<LoadingSpinner />}>
              <PediatricAdherence />
            </Suspense>
          } />
          <Route path="devices" element={
            <Suspense fallback={<LoadingSpinner />}>
              <DeviceManager />
            </Suspense>
          } />
          <Route path="medications" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Medications />
            </Suspense>
          } />
          <Route path="incontinence" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Incontinence />
            </Suspense>
          } />
          <Route path="rfid" element={
            <Suspense fallback={<LoadingSpinner />}>
              <RFIDManager />
            </Suspense>
          } />
          <Route path="apis" element={
            <Suspense fallback={<LoadingSpinner />}>
              <APIs />
            </Suspense>
          } />
          <Route path="medical-staff" element={
            <Suspense fallback={<LoadingSpinner />}>
              <MedicalStaff />
            </Suspense>
          } />
          <Route path="telehealth">
            <Route path="admin" element={
              <Suspense fallback={<LoadingSpinner />}>
                <TelehealthAdmin />
              </Suspense>
            } />
            <Route path="staff" element={
              <Suspense fallback={<LoadingSpinner />}>
                <TelehealthStaff />
              </Suspense>
            } />
          </Route>
          <Route index element={
            <Suspense fallback={<LoadingSpinner />}>
              <ContentManager />
            </Suspense>
          } />
        </Route>
      </Routes>
    </div>
  );
}