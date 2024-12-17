import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export function useMedicationAdherence(patientId) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientId) {
      fetchSchedules();
    }
  }, [patientId]);

  async function fetchSchedules() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_medication_schedule_details')
        .select('*')
        .eq('user_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError(error.message);
      toast.error('Failed to load medication schedules');
    } finally {
      setLoading(false);
    }
  }

  return {
    schedules,
    loading,
    error,
    refreshSchedules: fetchSchedules
  };
}