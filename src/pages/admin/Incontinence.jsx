import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import OrganizationSelect from '../../components/incontinence/OrganizationSelect';
import RoomGrid from '../../components/incontinence/RoomGrid';
import StatusSummary from '../../components/incontinence/StatusSummary';
import FilterDropdown from '../../components/FilterDropdown';

export default function Incontinence() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  const statusOptions = [
    { value: 'all', label: 'All Rooms' },
    { value: 'dry', label: 'No Wetness Detected' },
    { value: 'wet', label: 'Wetness Detected' },
    { value: 'no_detection', label: 'No Sensor In Range' }
  ];

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchBuildings(selectedProvider);
      fetchPatients(selectedProvider);
    } else {
      setBuildings([]);
      setSelectedBuilding('');
      setPatients([]);
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (selectedBuilding) {
      fetchRooms();
      const interval = setInterval(fetchRooms, 30000);
      return () => clearInterval(interval);
    } else {
      setRooms([]);
    }
  }, [selectedBuilding]);

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

  async function fetchPatients(providerId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          medical_record_number,
          room_id,
          rooms (
            id,
            room_number,
            building_id
          )
        `)
        .eq('healthcare_provider_id', providerId)
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    }
  }

  async function fetchRooms() {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select(`
          id,
          room_number,
          name,
          floor,
          active,
          users (
            id,
            name,
            medical_record_number
          )
        `)
        .eq('building_id', selectedBuilding)
        .order('floor')
        .order('room_number');

      if (roomError) throw roomError;

      const roomsWithStatus = await Promise.all(
        roomData.map(async (room) => {
          if (!room.users?.[0]?.id) return room;

          const { data: rfidData, error: rfidError } = await supabase
            .from('rfid_tags')
            .select('status, last_changed, last_scanned')
            .eq('user_id', room.users[0].id)
            .eq('active', true)
            .single();

          if (rfidError && rfidError.code !== 'PGRST116') {
            console.error('Error fetching RFID status:', rfidError);
            return room;
          }

          return {
            ...room,
            status: rfidData?.status || 'no_detection',
            last_changed: rfidData?.last_changed,
            last_scanned: rfidData?.last_scanned
          };
        })
      );

      const filteredRooms = statusFilter === 'all' 
        ? roomsWithStatus 
        : roomsWithStatus.filter(room => room.status === statusFilter);

      setRooms(filteredRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    }
  }

  async function handleAddTag(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const tagData = {
        tag_id: formData.get('tag_id'),
        user_id: formData.get('patient_id'),
        active: true
      };

      const { error } = await supabase
        .from('rfid_tags')
        .insert([tagData]);

      if (error) throw error;

      toast.success('RFID tag added successfully');
      setIsTagModalOpen(false);
      setSelectedPatient('');
      fetchRooms();
    } catch (error) {
      console.error('Error adding RFID tag:', error);
      toast.error('Failed to add RFID tag');
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
        <div>
          <Link 
            to="/admin"
            className="text-primary hover:text-primary-dark mb-4 inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Incontinence Monitoring</h1>
        </div>
        <button
          onClick={() => setIsTagModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          + Add RFID Tag
        </button>
      </div>

      <OrganizationSelect
        providers={providers}
        selectedProvider={selectedProvider}
        onProviderChange={setSelectedProvider}
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        onBuildingChange={setSelectedBuilding}
      />

      {selectedBuilding && (
        <>
          <StatusSummary rooms={rooms} />

          <div className="mb-8">
            <FilterDropdown
              label="Status Filter"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
            />
          </div>

          <RoomGrid rooms={rooms} />
        </>
      )}

      {/* Add RFID Tag Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add RFID Tag</h2>
              <button
                onClick={() => {
                  setIsTagModalOpen(false);
                  setSelectedPatient('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTag} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient</label>
                <select
                  name="patient_id"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.medical_record_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tag ID</label>
                <input
                  type="text"
                  name="tag_id"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsTagModalOpen(false);
                    setSelectedPatient('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  Add Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}