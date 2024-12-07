import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import StaffTable from '../../components/staff/StaffTable';
import StaffFilters from '../../components/staff/StaffFilters';
import toast from 'react-hot-toast';

export default function MedicalStaff() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchTerm, roleFilter, providerFilter]);

  async function fetchStaff() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          healthcare_providers (
            id,
            name
          ),
          user_roles (
            healthcare_roles_primary (
              id,
              name
            )
          )
        `)
        .order('name');

      if (error) throw error;

      // Filter to only include medical staff
      const medicalStaff = data?.filter(user => 
        user.user_roles?.some(role => 
          ['Nurse', 'Physician', 'Administrator', 'Telehealth Operations Manager', 
           'Virtual Care Coordinator', 'Telehealth Technical Support'].includes(role.healthcare_roles_primary?.name)
        )
      ) || [];

      setStaff(medicalStaff);
      setFilteredStaff(medicalStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load medical staff');
    } finally {
      setLoading(false);
    }
  }

  function filterStaff() {
    let filtered = [...staff];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.name?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search) ||
        member.phone?.toLowerCase().includes(search)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(member =>
        member.user_roles?.some(role => 
          role.healthcare_roles_primary?.name === roleFilter
        )
      );
    }

    if (providerFilter) {
      filtered = filtered.filter(member => 
        member.healthcare_provider_id === providerFilter
      );
    }

    setFilteredStaff(filtered);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Medical Staff</h1>
      </div>

      <StaffFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleChange={setRoleFilter}
        providerFilter={providerFilter}
        onProviderChange={setProviderFilter}
      />

      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredStaff.length} of {staff.length} staff members
      </div>

      <StaffTable 
        staff={filteredStaff}
        loading={loading}
      />
    </div>
  );
}