import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import FamilyContactsTable from '../../components/family/FamilyContactsTable';
import EditContactModal from '../../components/family/EditContactModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function FamilyContacts() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationFilter, setNotificationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [providerFilter, setProviderFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [contacts, searchTerm, notificationFilter, statusFilter, providerFilter, companyFilter]);

  async function fetchInitialData() {
    try {
      // Fetch contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('family_contacts')
        .select(`
          *,
          users (
            id,
            name,
            medical_record_number,
            healthcare_providers (
              id,
              name
            ),
            companies (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;
      setContacts(contactsData || []);
      setFilteredContacts(contactsData || []);

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

  function filterContacts() {
    let filtered = [...contacts];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.first_name?.toLowerCase().includes(search) ||
        contact.last_name?.toLowerCase().includes(search) ||
        contact.email?.toLowerCase().includes(search) ||
        contact.phone?.toLowerCase().includes(search) ||
        contact.users?.name?.toLowerCase().includes(search) ||
        contact.users?.medical_record_number?.toLowerCase().includes(search)
      );
    }

    if (notificationFilter) {
      filtered = filtered.filter(contact => {
        if (notificationFilter === 'email') return contact.notify_by_email;
        if (notificationFilter === 'phone') return contact.notify_by_phone;
        if (notificationFilter === 'both') return contact.notify_by_email && contact.notify_by_phone;
        if (notificationFilter === 'none') return !contact.notify_by_email && !contact.notify_by_phone;
        return true;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(contact => 
        statusFilter === 'active' ? contact.active : !contact.active
      );
    }

    if (providerFilter) {
      filtered = filtered.filter(contact => 
        contact.users?.healthcare_providers?.id === providerFilter
      );
    }

    if (companyFilter) {
      filtered = filtered.filter(contact => 
        contact.users?.companies?.id === companyFilter
      );
    }

    setFilteredContacts(filtered);
  }

  async function handleSave(data) {
    try {
      const { error } = await supabase
        .from('family_contacts')
        .update(data)
        .eq('id', selectedContact.id);

      if (error) throw error;
      toast.success('Contact updated successfully');
      setIsModalOpen(false);
      setSelectedContact(null);
      fetchInitialData();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast.error('Failed to update contact');
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading family contacts..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Family Contacts</h1>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="Search contacts..."
        />
        <FilterDropdown
          label="Healthcare Provider"
          value={providerFilter}
          onChange={setProviderFilter}
          options={[
            { value: '', label: 'All Providers' },
            ...providers.map(provider => ({
              value: provider.id,
              label: provider.name
            }))
          ]}
        />
        <FilterDropdown
          label="Company"
          value={companyFilter}
          onChange={setCompanyFilter}
          options={[
            { value: '', label: 'All Companies' },
            ...companies.map(company => ({
              value: company.id,
              label: company.name
            }))
          ]}
        />
        <FilterDropdown
          label="Notifications"
          value={notificationFilter}
          onChange={setNotificationFilter}
          options={[
            { value: '', label: 'All Notifications' },
            { value: 'email', label: 'Email Only' },
            { value: 'phone', label: 'Phone Only' },
            { value: 'both', label: 'Email & Phone' },
            { value: 'none', label: 'No Notifications' }
          ]}
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
        Showing {filteredContacts.length} of {contacts.length} contacts
      </div>

      <FamilyContactsTable 
        contacts={filteredContacts}
        onEdit={(contact) => {
          setSelectedContact(contact);
          setIsModalOpen(true);
        }}
      />

      {isModalOpen && selectedContact && (
        <EditContactModal
          contact={selectedContact}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
}