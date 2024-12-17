import React from 'react';
import PatientList from './PatientList';
import Filters from './Filters';
import useMedicationAdherence from './hooks/useMedicationAdherence';
import LoadingSpinner from '../../../../components/LoadingSpinner';

export default function MedicationAdherenceContent() {
  const {
    patients,
    filteredPatients,
    loading,
    filters,
    updateFilter,
    refreshData
  } = useMedicationAdherence();

  if (loading) {
    return <LoadingSpinner message="Loading patients..." />;
  }

  return (
    <>
      <Filters 
        filters={filters}
        onFilterChange={updateFilter}
      />

      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>

      <PatientList 
        patients={filteredPatients}
        onUpdate={refreshData}
      />
    </>
  );
}