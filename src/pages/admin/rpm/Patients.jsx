import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import SearchBar from '../../../components/SearchBar';
import FilterDropdown from '../../../components/FilterDropdown';
import PatientTable from '../../../components/PatientTable';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter, providerFilter, companyFilter]);

  async function fetchData() {
    try {
      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
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
        .eq('is_patient', true)
        .order('name');

      if (patientsError) throw patientsError;
      setPatients(patientsData || []);
      setFilteredPatients(patientsData || []);

      // Fetch providers
      const { data: providersData, error: providersError } = await supabase
        .from('healthcare_providers')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (providersError) throw providersError;
      setProviders(providersData || []);

      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('active', true)
        .order('name');

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);
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

    if (companyFilter) {
      filtered = filtered.filter(patient => 
        patient.company_id === companyFilter
      );
    }

    setFilteredPatients(filtered);
  }

  if (loading) {
    return <LoadingSpinner message="Loading patients..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Remote Patient Monitoring</h1>
      </div>

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
          label="Company"
          value={companyFilter}
          onChange={setCompanyFilter}
          options={companies.map(company => ({
            value: company.id,
            label: company.name
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
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredPatients.length} of {patients.length} patients
      </div>

      <PatientTable 
        patients={filteredPatients}
        onUpdate={fetchData}
      />
    </div>
  );
}