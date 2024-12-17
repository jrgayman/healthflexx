import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import MedicationList from '../../../components/medications/MedicationList';
import { CurrentSessionGrid, SessionHistory } from '../../../components/medications/sessions';
import AddMedicationModal from '../../../components/medications/AddMedicationModal';
import LTEHubManager from '../../../components/medications/LTEHubManager';
import LoadingSpinner from '../../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PatientAdherence() {
  const { patient } = useOutletContext();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMedication, setIsAddingMedication] = useState(false);

  useEffect(() => {
    if (patient?.id) {
      fetchPatientData();
    }
  }, [patient]);

  async function fetchPatientData() {
    try {
      const { data, error } = await supabase
        .from('patient_medications')
        .select(`
          *,
          medications (
            id,
            brand_name,
            generic_name
          )
        `)
        .eq('user_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load medication data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading medication data..." />;
  }

  return (
    <div className="space-y-8">
      <div>
        <LTEHubManager patientId={patient.id} />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsAddingMedication(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Add Medication
          </button>
        </div>
      </div>

      <MedicationList 
        medications={medications} 
        onUpdate={fetchPatientData}
      />

      <CurrentSessionGrid patientId={patient.id} />
      
      <SessionHistory patientId={patient.id} />

      <AddMedicationModal
        isOpen={isAddingMedication}
        onClose={() => setIsAddingMedication(false)}
        patientId={patient.id}
        onMedicationAdded={fetchPatientData}
      />
    </div>
  );
}