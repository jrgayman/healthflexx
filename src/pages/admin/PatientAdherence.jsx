import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import PatientHeader from '../../components/PatientHeader';
import MedicationList from '../../components/medications/MedicationList';
import CurrentSessionGrid from '../../components/medications/CurrentSessionGrid';
import SessionHistory from '../../components/medications/SessionHistory';
import AddMedicationModal from '../../components/medications/AddMedicationModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PatientAdherence() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMedication, setIsAddingMedication] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  async function fetchPatientData() {
    try {
      // Fetch patient details and medications
      const { data: patientData, error: patientError } = await supabase
        .from('users')
        .select(`
          *,
          healthcare_providers (
            id,
            name
          ),
          patient_medications (
            id,
            medication_id,
            dosage,
            frequency,
            instructions,
            active,
            medications (
              id,
              brand_name,
              generic_name
            )
          ),
          notification_preferences (
            id,
            notify_by_phone,
            notify_by_email
          ),
          family_contacts (
            id,
            first_name,
            last_name,
            phone,
            email,
            notify_by_phone,
            notify_by_email,
            active
          )
        `)
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);
      setMedications(patientData.patient_medications || []);

      // Fetch session history
      const { data: historyData, error: historyError } = await supabase
        .from('medication_session_summary')
        .select('*')
        .eq('patient_id', id)
        .eq('active', false)
        .order('start_date', { ascending: false });

      if (historyError) throw historyError;
      setSessionHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Not Found</h1>
          <Link
            to="/admin/medication-adherence"
            className="text-primary hover:text-primary-dark"
          >
            ← Back to Medication Adherence
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin/medication-adherence"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Medication Adherence
        </Link>
        <PatientHeader patient={patient} />
      </div>

      <div className="flex justify-end mb-8">
        <button
          onClick={() => setIsAddingMedication(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Medication
        </button>
      </div>

      <div className="space-y-8">
        <MedicationList 
          medications={medications} 
          onUpdate={fetchPatientData}
        />

        <CurrentSessionGrid patientId={id} />
        
        <SessionHistory 
          sessions={sessionHistory} 
          patientId={id}
        />
      </div>

      <AddMedicationModal
        isOpen={isAddingMedication}
        onClose={() => setIsAddingMedication(false)}
        patientId={id}
        onMedicationAdded={fetchPatientData}
      />
    </div>
  );
}