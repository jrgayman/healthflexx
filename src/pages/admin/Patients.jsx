import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchPatients } from '../../lib/patientUtils';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import PatientTable from '../../components/PatientTable';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter, providerFilter, roomFilter]);

  async function fetchData() {
    try {
      // Fetch patients
      const patientsData = await fetchPatients();
      setPatients(patientsData);
      setFilteredPatients(patientsData);

      // Fetch healthcare providers
      const { data: providersData, error: providersError } = await supabase
        .from('healthcare_providers')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (providersError) throw providersError;
      setProviders(providersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function filterPatients() {
    let filtered = [...patients];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.name?.toLowerCase().includes(search) ||
        patient.medical_record_number?.toLowerCase().includes(search) ||
        patient.email?.toLowerCase().includes(search) ||
        patient.phone?.toLowerCase().includes(search)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(patient => 
        statusFilter === 'active' ? patient.active : !patient.active
      );
    }

    if (providerFilter) {
      filtered = filtered.filter(patient => 
        patient.healthcare_provider_id === providerFilter
      );
    }

    if (roomFilter) {
      filtered = filtered.filter(patient => 
        roomFilter === 'assigned' ? patient.rooms : !patient.rooms
      );
    }

    setFilteredPatients(filtered);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="Search patients..."
        />
        <FilterDropdown
          label="Healthcare Provider"
          value={providerFilter}
          onChange={setProviderFilter}
          options={providers.map(provider => ({
            value: provider.id,
            label: provider.name
          }))}
        />
        <FilterDropdown
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        />
        <FilterDropdown
          label="Room Assignment"
          value={roomFilter}
          onChange={setRoomFilter}
          options={[
            { value: 'assigned', label: 'Room Assigned' },
            { value: 'unassigned', label: 'No Room' }
          ]}
        />
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>

      {/* Patient Table */}
      <PatientTable 
        patients={filteredPatients}
        onUpdate={fetchData}
      />
    </div>
  );
}