import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export function useRPMPatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  async function fetchPatientData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          healthcare_providers (
            id,
            name
          ),
          companies (
            id,
            name
          )
        `)
        .eq('id', patientId)
        .single();

      if (error) throw error;
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      setError(error.message);
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  }

  return {
    patient,
    loading,
    error,
    refreshPatient: fetchPatientData
  };
}