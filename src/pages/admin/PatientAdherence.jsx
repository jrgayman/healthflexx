import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MedicationList from '../../components/medications/MedicationList';
import CurrentSessionGrid from '../../components/medications/CurrentSessionGrid';
import SessionHistory from '../../components/medications/SessionHistory';
import AddMedicationModal from '../../components/medications/AddMedicationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PatientAdherence() {
  const { patient } = useOutletContext();
  const [medications, setMedications] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMedication, setIsAddingMedication] = useState(false);

  useEffect(() => {
    if (patient?.id) {
      fetchPatientData();
    }
  }, [patient]);

  async function fetchPatientData() {
    try {
      // Fetch medications
      const { data: medsData, error: medsError } = await supabase
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

      if (medsError) throw medsError;
      setMedications(medsData || []);

      // Fetch session history
      const { data: historyData, error: historyError } = await supabase
        .from('medication_session_summary')
        .select('*')
        .eq('patient_id', patient.id)
        .eq('active', false)
        .order('start_date', { ascending: false });

      if (historyError) throw historyError;
      setSessionHistory(historyData || []);
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
        onUpdate={fetchPatientData}
      />

      <CurrentSessionGrid patientId={patient.id} />
      
      <SessionHistory 
        sessions={sessionHistory} 
        patientId={patient.id}
      />

      <AddMedicationModal
        isOpen={isAddingMedication}
        onClose={() => setIsAddingMedication(false)}
        patientId={patient.id}
        onMedicationAdded={fetchPatientData}
      />
    </div>
  );
}