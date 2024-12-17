import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

export function usePatients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    provider: '',
    company: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, filters]);

  async function fetchPatients() {
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
          ),
          patient_medication_schedules (
            id,
            medication_id,
            frequency_code,
            active,
            medications (
              id,
              brand_name,
              generic_name
            )
          )
        `)
        .eq('is_patient', true)
        .order('name');

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError(error.message);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

  function filterPatients() {
    let filtered = [...patients];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name?.toLowerCase().includes(search) ||
        patient.medical_record_number?.toLowerCase().includes(search) ||
        patient.email?.toLowerCase().includes(search) ||
        patient.phone?.toLowerCase().includes(search)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(patient => 
        filters.status === 'active' ? patient.active : !patient.active
      );
    }

    if (filters.provider) {
      filtered = filtered.filter(patient => 
        patient.healthcare_provider_id === filters.provider
      );
    }

    if (filters.company) {
      filtered = filtered.filter(patient => 
        patient.company_id === filters.company
      );
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
    patients: filteredPatients,
    totalCount: patients.length,
    loading,
    error,
    filters,
    updateFilter,
    refreshPatients: fetchPatients
  };
}