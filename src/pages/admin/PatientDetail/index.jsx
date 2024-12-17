jsx
import React from 'react';
import { Routes, Route, Navigate, useParams, Link } from 'react-router-dom';
import PatientHeader from '../../../components/patients/PatientHeader';
import PatientTabs from '../../../components/patients/PatientTabs';
import usePatientData from '../../../hooks/usePatientData';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function PatientDetail() {
  const { id } = useParams();
  const { patient, loading, error, refreshPatient } = usePatientData(id);

  if (loading) {
    return <LoadingSpinner message="Loading patient data..." />;
  }

  if (error || !patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h1>
          <Link
            to="/admin/patients"
            className="text-primary hover:text-primary-dark"
          >
            ← Back to Patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin/patients"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Patients
        </Link>
        <PatientHeader patient={patient} onUpdate={refreshPatient} />
      </div>

      <PatientTabs patientId={id} />
      <Outlet context={{ patient }} />
    </div>
  );
}