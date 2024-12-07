import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import FilterDropdown from '../../components/FilterDropdown';

export default function RFIDManager() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deviceTypes, setDeviceTypes] = useState([]);

  useEffect(() => {
    fetchProviders();
    fetchDeviceTypes();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchBuildings(selectedProvider);
    } else {
      setBuildings([]);
      setSelectedBuilding('');
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (selectedBuilding) {
      fetchRooms();
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

  async function fetchRooms() {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          users (
            id,
            name,
            medical_record_number
          ),
          devices (
            id,
            device_name,
            serial_number,
            mac_address,
            active,
            device_types (
              id,
              name,
              device_classifications (
                id,
                name
              )
            )
          )
        `)
        .eq('building_id', selectedBuilding)
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    }
  }

  async function fetchDeviceTypes() {
    try {
      const { data, error } = await supabase
        .from('device_types')
        .select(`
          *,
          device_classifications (
            id,
            name
          )
        `)
        .eq('device_classifications.name', 'Incontinence Scanner')
        .order('name');

      if (error) throw error;
      setDeviceTypes(data || []);
    } catch (error) {
      console.error('Error fetching device types:', error);
      toast.error('Failed to load device types');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const deviceData = {
        device_type_id: formData.get('device_type'),
        device_name: deviceTypes.find(t => t.id === formData.get('device_type'))?.name || 'RFID Scanner',
        serial_number: formData.get('serial_number'),
        mac_address: formData.get('mac_address'),
        room_id: selectedRoom.id,
        active: true
      };

      const { error } = await supabase
        .from('devices')
        .insert([deviceData]);

      if (error) throw error;

      toast.success('Scanner added successfully');
      setIsModalOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error adding device:', error);
      toast.error('Failed to add scanner');
    }
  }

  async function handleDeactivate(deviceId) {
    try {
      const { error } = await supabase
        .from('devices')
        .update({ active: false })
        .eq('id', deviceId);

      if (error) throw error;
      toast.success('Scanner deactivated');
      fetchRooms();
    } catch (error) {
      console.error('Error deactivating device:', error);
      toast.error('Failed to deactivate scanner');
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
        <h1 className="text-3xl font-bold text-gray-900">RFID Scanner Management</h1>
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
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scanner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC Address</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rooms.map((room) => {
                  const activeDevice = room.devices?.find(d => d.active);
                  return (
                    <tr key={room.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          Room {room.room_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {room.floor ? `Floor ${room.floor}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {room.users?.[0]?.name || 'Unassigned'}
                        </div>
                        {room.users?.[0]?.medical_record_number && (
                          <div className="text-sm text-gray-500">
                            MRN: {room.users[0].medical_record_number}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {activeDevice?.device_types?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {activeDevice?.serial_number || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {activeDevice?.mac_address || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4">
                        {!activeDevice && room.users?.[0] && (
                          <button
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsModalOpen(true);
                            }}
                            className="text-primary hover:text-primary-dark"
                          >
                            Add Scanner
                          </button>
                        )}
                        {activeDevice && (
                          <button
                            onClick={() => handleDeactivate(activeDevice.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Scanner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add RFID Scanner</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedRoom(null);
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
                <label className="block text-sm font-medium text-gray-700">Scanner Type</label>
                <select
                  name="device_type"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">Select Type</option>
                  {deviceTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                <input
                  type="text"
                  name="serial_number"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">MAC Address</label>
                <input
                  type="text"
                  name="mac_address"
                  pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                  placeholder="XX:XX:XX:XX:XX:XX"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                <p className="mt-1 text-sm text-gray-500">Format: XX:XX:XX:XX:XX:XX</p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedRoom(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  Add Scanner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}