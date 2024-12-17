import React from 'react';
import { Link } from 'react-router-dom';
import MedicationAdherenceContent from './Content';
import LoadingSpinner from '../../../../components/LoadingSpinner';

export default function MedicationAdherence() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin/rpm/patients"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Patients
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Medication Adherence</h1>
      </div>

      <React.Suspense fallback={<LoadingSpinner message="Loading medication data..." />}>
        <MedicationAdherenceContent />
      </React.Suspense>
    </div>
  );
}