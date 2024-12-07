import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [providers, setProviders] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [accessLevelFilter, setAccessLevelFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  const accessLevels = [
    { value: 'Super Admin', label: 'Super Admin' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Content Creator', label: 'Content Creator' },
    { value: 'Reader', label: 'Reader' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, accessLevelFilter, companyFilter, providerFilter]);

  async function fetchInitialData() {
    try {
      // Fetch users with relationships
      const { data: userData, error: userError } = await supabase
        .from('user_details')
        .select('*')
        .order('name');

      if (userError) throw userError;
      setUsers(userData || []);
      setFilteredUsers(userData || []);

      // Fetch companies
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('active', true)
        .order('name');

      if (companyError) throw companyError;
      setCompanies(companyData || []);

      // Fetch healthcare providers
      const { data: providerData, error: providerError } = await supabase
        .from('healthcare_providers')
        .select('*')
        .eq('active', true)
        .order('name');

      if (providerError) throw providerError;
      setProviders(providerData || []);

      // Fetch healthcare roles
      const { data: roleData, error: roleError } = await supabase
        .from('healthcare_roles_primary')
        .select('*')
        .order('name');

      if (roleError) throw roleError;
      setRoles(roleData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  function filterUsers() {
    let filtered = [...users];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search)
      );
    }

    if (accessLevelFilter) {
      filtered = filtered.filter(user => user.access_level === accessLevelFilter);
    }

    if (companyFilter) {
      filtered = filtered.filter(user => user.company_id === companyFilter);
    }

    if (providerFilter) {
      filtered = filtered.filter(user => user.healthcare_provider_id === providerFilter);
    }

    setFilteredUsers(filtered);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const userData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      access_level: formData.get('access_level'),
      company_id: formData.get('company_id') || null,
      healthcare_provider_id: formData.get('healthcare_provider_id') || null
    };

    try {
      let userId;
      if (selectedUser) {
        const { error: updateError } = await supabase
          .from('users')
          .update(userData)
          .eq('id', selectedUser.id);

        if (updateError) throw updateError;
        userId = selectedUser.id;
      } else {
        // For new users, set a default password
        userData.password_hash = '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy';
        
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([userData])
          .select()
          .single();

        if (insertError) throw insertError;
        userId = data.id;
      }

      // Update user roles
      if (userId) {
        // First remove existing roles
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Then add new roles
        if (selectedRoles.length > 0) {
          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(selectedRoles.map(roleId => ({
              user_id: userId,
              role_id: roleId
            })));

          if (rolesError) throw rolesError;
        }
      }

      toast.success(selectedUser ? 'User updated!' : 'User created!');
      setIsModalOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
      fetchInitialData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error saving user');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={() => {
            setSelectedUser(null);
            setSelectedRoles([]);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="Search users..."
        />
        <FilterDropdown
          label="Access Level"
          value={accessLevelFilter}
          onChange={setAccessLevelFilter}
          options={accessLevels}
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
          label="Healthcare Provider"
          value={providerFilter}
          onChange={setProviderFilter}
          options={providers.map(provider => ({
            value: provider.id,
            label: provider.name
          }))}
        />
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Level</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                        alt=""
                        className="h-10 w-10 rounded-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                        }}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.company_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.provider_name || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {user.roles?.map((role, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.access_level === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                      user.access_level === 'Admin' ? 'bg-blue-100 text-blue-800' :
                      user.access_level === 'Content Creator' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.access_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedRoles(user.roles?.map(r => r.id) || []);
                        setIsModalOpen(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUser(null);
                  setSelectedRoles([]);
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
                  defaultValue={selectedUser?.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedUser?.email}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={selectedUser?.phone}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <select
                  name="company_id"
                  defaultValue={selectedUser?.company_id || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">No Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Healthcare Provider</label>
                <select
                  name="healthcare_provider_id"
                  defaultValue={selectedUser?.healthcare_provider_id || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">No Provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                  {roles.map(role => (
                    <label key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => {
                          setSelectedRoles(current => {
                            if (current.includes(role.id)) {
                              return current.filter(id => id !== role.id);
                            }
                            return [...current, role.id];
                          });
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Access Level</label>
                <select
                  name="access_level"
                  defaultValue={selectedUser?.access_level || 'Reader'}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  {accessLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                    setSelectedRoles([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  {selectedUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}