import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import RoomGrid from '../../components/RoomGrid';

export default function RoomManager() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchBuildings(selectedProvider);
    } else {
      setBuildings([]);
      setSelectedBuilding('');
    }
  }, [selectedProvider]);

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
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBuildings(providerId) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, name')
        .eq('healthcare_provider_id', providerId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setBuildings(data || []);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      toast.error('Failed to load buildings');
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Room Manager</h1>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FilterDropdown
          label="Healthcare Provider"
          value={selectedProvider}
          onChange={setSelectedProvider}
          options={providers.map(provider => ({
            value: provider.id,
            label: provider.name
          }))}
        />
        <FilterDropdown
          label="Building"
          value={selectedBuilding}
          onChange={setSelectedBuilding}
          options={buildings.map(building => ({
            value: building.id,
            label: building.name
          }))}
        />
      </div>

      {selectedBuilding && (
        <RoomGrid
          buildingId={selectedBuilding}
          providerId={selectedProvider}
        />
      )}
    </div>
  );
}