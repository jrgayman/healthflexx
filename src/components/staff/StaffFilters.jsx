import SearchBar from '../SearchBar';
import FilterDropdown from '../FilterDropdown';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function StaffFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  providerFilter,
  onProviderChange
}) {
  const [providers, setProviders] = useState([]);
  
  const roles = [
    { value: 'Physician', label: 'Physician' },
    { value: 'Nurse', label: 'Nurse' },
    { value: 'Administrator', label: 'Administrator' },
    { value: 'Telehealth Operations Manager', label: 'Telehealth Operations Manager' },
    { value: 'Virtual Care Coordinator', label: 'Virtual Care Coordinator' },
    { value: 'Telehealth Technical Support', label: 'Telehealth Technical Support' }
  ];

  useEffect(() => {
    async function fetchProviders() {
      try {
        const { data, error } = await supabase
          .from('healthcare_providers')
          .select('id, name')
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setProviders(data || []);
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    }

    fetchProviders();
  }, []);

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <SearchBar 
        onSearch={onSearchChange} 
        placeholder="Search staff members..."
      />
      <FilterDropdown
        label="Role"
        value={roleFilter}
        onChange={onRoleChange}
        options={roles}
      />
      <FilterDropdown
        label="Healthcare Provider"
        value={providerFilter}
        onChange={onProviderChange}
        options={providers.map(provider => ({
          value: provider.id,
          label: provider.name
        }))}
      />
    </div>
  );
}