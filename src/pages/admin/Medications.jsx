import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import MedicationFilters from '../../components/medications/MedicationFilters';
import MedicationTable from '../../components/medications/MedicationTable';
import toast from 'react-hot-toast';

export default function Medications() {
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [pharmClasses, setPharmClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [recordCount, setRecordCount] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    fetchMedications();
    checkSyncStatus();
  }, []);

  useEffect(() => {
    filterMedications();
  }, [medications, searchTerm, statusFilter, classFilter]);

  async function checkSyncStatus() {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('last_synced', { count: 'exact' })
        .order('last_synced', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data?.length > 0) {
        setLastSynced(new Date(data[0].last_synced));
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;
      setRecordCount(count || 0);

    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const response = await fetch('/api/medications/sync', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start sync');
      }

      toast.success('Sync started successfully');
      
      // Poll for updates every 5 seconds
      const interval = setInterval(async () => {
        await checkSyncStatus();
      }, 5000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        setSyncing(false);
        fetchMedications();
      }, 300000);

    } catch (error) {
      console.error('Error syncing medications:', error);
      toast.error('Failed to sync medications');
      setSyncing(false);
    }
  }

  async function fetchMedications() {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('brand_name');

      if (error) throw error;
      setMedications(data || []);

      // Extract unique pharm classes
      const classes = [...new Set(data.map(med => med.pharm_class))].filter(Boolean);
      setPharmClasses(classes.sort());
    } catch (error) {
      console.error('Error fetching medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setLoading(false);
    }
  }

  function filterMedications() {
    let filtered = [...medications];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(med => 
        med.brand_name?.toLowerCase().includes(search) ||
        med.generic_name?.toLowerCase().includes(search) ||
        med.pharm_class?.toLowerCase().includes(search) ||
        med.manufacturer?.toLowerCase().includes(search)
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(med => 
        statusFilter === 'active' ? med.active : !med.active
      );
    }

    if (classFilter) {
      filtered = filtered.filter(med => med.pharm_class === classFilter);
    }

    setFilteredMedications(filtered);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">FDA Medications Database</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {recordCount.toLocaleString()} records
            {lastSynced && (
              <span className="ml-2">
                · Last synced: {lastSynced.toLocaleDateString()}
              </span>
            )}
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </span>
            ) : (
              'Sync with FDA'
            )}
          </button>
        </div>
      </div>

      <MedicationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        classFilter={classFilter}
        onClassChange={setClassFilter}
        pharmClasses={pharmClasses}
      />

      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredMedications.length} of {medications.length} medications
      </div>

      <MedicationTable medications={filteredMedications} />
    </div>
  );
}