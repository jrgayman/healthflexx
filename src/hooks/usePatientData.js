import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function usePatientData(patientId) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchPatientData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*, healthcare_providers!inner(id, name), companies!inner(id, name)')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      setPatient(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching patient:', error);
      setError(error.message);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  return {
    patient,
    loading,
    error,
    refreshPatient: fetchPatientData
  };
}