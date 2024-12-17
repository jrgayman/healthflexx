import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabase';
import toast from 'react-hot-toast';

export default function useMedicationAdherence() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, filters]);

  async function fetchData() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          medication_sessions (
            id,
            start_date,
            end_date,
            active,
            first_use_date,
            medication_tracking_records (
              id,
              status,
              taken_at,
              dose_count
            )
          )
        `)
        .eq('is_patient', true)
        .order('name');

      if (error) throw error;

      // Process adherence data
      const processedPatients = data?.map(patient => {
        const activeSessions = patient.medication_sessions?.filter(s => s.active) || [];
        const adherenceRate = calculateAdherenceRate(activeSessions);
        
        return {
          ...patient,
          active_sessions: activeSessions.length,
          adherence_rate: adherenceRate
        };
      }) || [];

      setPatients(processedPatients);
      setFilteredPatients(processedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

  function calculateAdherenceRate(sessions) {
    if (!sessions.length) return 0;

    const allRecords = sessions.flatMap(s => s.medication_tracking_records || []);
    if (!allRecords.length) return 0;

    const takenDoses = allRecords.filter(r => r.status === 'taken').length;
    return Math.round((takenDoses / allRecords.length) * 100);
  }

  function filterPatients() {
    let filtered = [...patients];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name?.toLowerCase().includes(search) ||
        patient.medical_record_number?.toLowerCase().includes(search)
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(patient => {
        if (filters.status === 'active') {
          return patient.active_sessions > 0;
        }
        if (filters.status === 'high') {
          return patient.adherence_rate >= 80;
        }
        if (filters.status === 'low') {
          return patient.adherence_rate < 80;
        }
        return true;
      });
    }

    setFilteredPatients(filtered);
  }

  function updateFilter(key, value) {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }

  return {
    patients,
    filteredPatients,
    loading,
    filters,
    updateFilter,
    refreshData: fetchData
  };
}