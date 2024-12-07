import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import BuildingList from '../../components/BuildingList';

export default function Organizations() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [providers, setProviders] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (expandedCompany) {
      fetchBuildings(expandedCompany);
    }
  }, [expandedCompany]);

  async function fetchInitialData() {
    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select(`
          *,
          healthcare_providers (
            id,
            name
          )
        `)
        .order('name');

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);
      setFilteredCompanies(companiesData || []);

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

  async function fetchBuildings(companyId) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('healthcare_provider_id', companyId)
        .order('name');

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Failed to load buildings');
    }
  }

  function filterCompanies() {
    let filtered = [...companies];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(search) ||
        company.description?.toLowerCase().includes(search) ||
        company.contact_email?.toLowerCase().includes(search) ||
        company.contact_phone?.toLowerCase().includes(search)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(company => 
        statusFilter === 'active' ? company.active : !company.active
      );
    }

    if (providerFilter) {
      filtered = filtered.filter(company => 
        company.healthcare_provider_id === providerFilter
      );
    }

    setFilteredCompanies(filtered);
  }

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter, providerFilter]);

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const companyData = {
      name: formData.get('name'),
      industry: formData.get('industry'),
      tax_id: formData.get('tax_id'),
      contact_email: formData.get('contact_email'),
      contact_phone: formData.get('contact_phone'),
      website: formData.get('website'),
      healthcare_provider_id: formData.get('healthcare_provider_id') || null,
      active: formData.get('active') === 'on'
    };

    try {
      let error;
      if (selectedCompany) {
        ({ error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', selectedCompany.id));
      } else {
        ({ error } = await supabase
          .from('companies')
          .insert([companyData]));
      }

      if (error) throw error;

      toast.success(selectedCompany ? 'Company updated!' : 'Company created!');
      setIsModalOpen(false);
      setSelectedCompany(null);
      fetchInitialData();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Error saving company');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Company deleted!');
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
        <button
          onClick={() => {
            setSelectedCompany(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Company
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="Search companies..."
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
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredCompanies.length} of {companies.length} companies
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Healthcare Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.industry}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {company.healthcare_providers?.name || 'Unassigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{company.contact_email}</div>
                    <div className="text-sm text-gray-500">{company.contact_phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {company.website && (
                      <a 
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary-dark"
                      >
                        Visit Website
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      company.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {company.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setIsModalOpen(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCompany ? 'Edit Company' : 'Add Company'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedCompany(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedCompany?.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <input
                  type="text"
                  name="industry"
                  defaultValue={selectedCompany?.industry}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                <input
                  type="text"
                  name="tax_id"
                  defaultValue={selectedCompany?.tax_id}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Healthcare Provider</label>
                <select
                  name="healthcare_provider_id"
                  defaultValue={selectedCompany?.healthcare_provider_id || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">Select Provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  defaultValue={selectedCompany?.contact_email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  defaultValue={selectedCompany?.contact_phone}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  name="website"
                  defaultValue={selectedCompany?.website}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={selectedCompany?.active ?? true}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedCompany(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  {selectedCompany ? 'Update Company' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}