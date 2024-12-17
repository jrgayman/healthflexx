import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MedicationList from '../medications/MedicationList';
import AddMedicationModal from '../medications/AddMedicationModal';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

export default function PatientMedications() {
  const { patient } = useOutletContext();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMedication, setIsAddingMedication] = useState(false);

  useEffect(() => {
    if (patient?.id) {
      fetchMedications();
    }
  }, [patient]);

  async function fetchMedications() {
    try {
      const { data, error } = await supabase
        .from('patient_medications')
        .select('*, medications!inner(id, brand_name, generic_name)')
        .eq('user_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading medications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAddingMedication(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Medication
        </button>
      </div>

      <MedicationList 
        medications={medications} 
        onUpdate={fetchMedications}
      />

      <AddMedicationModal
        isOpen={isAddingMedication}
        onClose={() => setIsAddingMedication(false)}
        patientId={patient.id}
        onMedicationAdded={fetchMedications}
      />
    </div>
  );
}