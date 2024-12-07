import React from 'react';
import { useParams, Link } from 'react-router-dom';
import AdherenceHistory from '../../components/medications/AdherenceHistory';

export default function MedicationHistory() {
  const { patientId, scheduleId } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin/medication-adherence"
          className="text-primary hover:text-primary-dark inline-flex items-center"
        >
          ← Back to Medication Adherence
        </Link>
      </div>

      <AdherenceHistory scheduleId={scheduleId} />
    </div>
  );
}