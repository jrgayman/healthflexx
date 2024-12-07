import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import BuildingList from '../../components/BuildingList';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchBuildings(selectedProvider.id);
    }
  }, [selectedProvider]);

  async function fetchProviders() {
    try {
      const { data, error } = await supabase
        .from('healthcare_providers')
        .select('*')
        .order('name');

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBuildings(providerId) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('healthcare_provider_id', providerId)
        .order('name');

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Failed to load buildings');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const providerData = {
      name: formData.get('name'),
      license_number: formData.get('license_number'),
      tax_id: formData.get('tax_id'),
      contact_email: formData.get('contact_email'),
      contact_phone: formData.get('contact_phone'),
      website: formData.get('website'),
      active: formData.get('active') === 'on'
    };

    try {
      let error;
      if (selectedProvider) {
        ({ error } = await supabase
          .from('healthcare_providers')
          .update(providerData)
          .eq('id', selectedProvider.id));
      } else {
        ({ error } = await supabase
          .from('healthcare_providers')
          .insert([providerData]));
      }

      if (error) throw error;

      toast.success(selectedProvider ? 'Provider updated!' : 'Provider added!');
      setIsModalOpen(false);
      setSelectedProvider(null);
      fetchProviders();
    } catch (error) {
      console.error('Error saving provider:', error);
      toast.error('Error saving provider');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this provider?')) return;

    try {
      const { error } = await supabase
        .from('healthcare_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Provider deleted!');
      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast.error('Failed to delete provider');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Healthcare Providers</h1>
        <button
          onClick={() => {
            setSelectedProvider(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Provider
        </button>
      </div>

      {/* Provider Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Provider</label>
        <select
          value={selectedProvider?.id || ''}
          onChange={(e) => {
            const provider = providers.find(p => p.id === e.target.value);
            setSelectedProvider(provider || null);
          }}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Select a provider</option>
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {/* Buildings List */}
      {selectedProvider && (
        <BuildingList
          buildingId={selectedProvider.id}
          organizationId={selectedProvider.id}
          buildings={buildings}
          onUpdate={() => fetchBuildings(selectedProvider.id)}
        />
      )}

      {/* Provider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProvider ? 'Edit Provider' : 'Add Provider'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedProvider(null);
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
                  defaultValue={selectedProvider?.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input
                  type="text"
                  name="license_number"
                  defaultValue={selectedProvider?.license_number}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                <input
                  type="text"
                  name="tax_id"
                  defaultValue={selectedProvider?.tax_id}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  defaultValue={selectedProvider?.contact_email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  defaultValue={selectedProvider?.contact_phone}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="url"
                  name="website"
                  defaultValue={selectedProvider?.website}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={selectedProvider?.active ?? true}
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
                    setSelectedProvider(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  {selectedProvider ? 'Update Provider' : 'Add Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}