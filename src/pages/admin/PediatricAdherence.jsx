import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PediatricAdherenceTable from '../../components/pediatric/PediatricAdherenceTable';
import StartSessionModal from '../../components/pediatric/StartSessionModal';

export default function PediatricAdherence() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter]);

  async function fetchPatients() {
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

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name?.toLowerCase().includes(search) ||
        patient.medical_record_number?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => {
        if (statusFilter === 'active') {
          return patient.active_sessions > 0;
        }
        if (statusFilter === 'high') {
          return patient.adherence_rate >= 80;
        }
        if (statusFilter === 'low') {
          return patient.adherence_rate < 80;
        }
        return true;
      });
    }

    setFilteredPatients(filtered);
  }

  if (loading) {
    return <LoadingSpinner message="Loading patient data..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pediatric Adherence</h1>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="Search patients..."
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Patients' },
            { value: 'active', label: 'Active Sessions' },
            { value: 'high', label: 'High Adherence (≥80%)' },
            { value: 'low', label: 'Low Adherence (<80%)' }
          ]}
        />
      </div>

      <PediatricAdherenceTable 
        patients={filteredPatients}
        onStartSession={(patientId) => {
          setSelectedPatientId(patientId);
          setIsStartingSession(true);
        }}
      />

      {isStartingSession && selectedPatientId && (
        <StartSessionModal
          isOpen={isStartingSession}
          onClose={() => {
            setIsStartingSession(false);
            setSelectedPatientId(null);
          }}
          patientId={selectedPatientId}
          onSessionStarted={() => {
            fetchPatients();
            setIsStartingSession(false);
            setSelectedPatientId(null);
          }}
        />
      )}
    </div>
  );
}