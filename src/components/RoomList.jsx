import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function RoomList({ buildingId, organizationId, rooms, onUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchAvailablePatients();
    }
  }, [organizationId]);

  async function fetchAvailablePatients() {
    try {
      const { data, error } = await supabase
        .from('patient_details')
        .select('id, user_id, patient_name, medical_record_number')
        .is('room_id', null)
        .eq('active', true)
        .order('patient_name');

      if (error) throw error;
      setAvailablePatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load available patients');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const roomData = {
      building_id: buildingId,
      room_number: formData.get('room_number'),
      name: formData.get('name'),
      floor: formData.get('floor'),
      capacity: parseInt(formData.get('capacity'), 10) || null,
      active: formData.get('active') === 'on'
    };

    try {
      let error;
      if (selectedRoom) {
        ({ error } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', selectedRoom.id));
      } else {
        ({ error } = await supabase
          .from('rooms')
          .insert([roomData]));
      }

      if (error) throw error;

      // If a patient was selected, assign them to the room
      const patientId = formData.get('patient_id');
      if (patientId) {
        const { error: patientError } = await supabase
          .from('patients')
          .update({ room_id: selectedRoom?.id })
          .eq('id', patientId);

        if (patientError) throw patientError;
      }

      toast.success(selectedRoom ? 'Room updated!' : 'Room added!');
      setIsModalOpen(false);
      setSelectedRoom(null);
      onUpdate();
      fetchAvailablePatients(); // Refresh available patients list
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Error saving room');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Room deleted!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold text-gray-900">Rooms</h4>
        <button
          onClick={() => {
            setSelectedRoom(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm"
        >
          Add Room
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{room.room_number}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{room.name || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{room.floor || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{room.capacity || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {room.patients?.[0]?.name || 'Unassigned'}
                    {room.patients?.[0]?.medical_record_number && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({room.patients[0].medical_record_number})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    room.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {room.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      setIsModalOpen(true);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
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

      {/* Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedRoom ? 'Edit Room' : 'Add Room'}
              </h2>
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
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <input
                  type="text"
                  name="room_number"
                  defaultValue={selectedRoom?.room_number}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={selectedRoom?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Floor</label>
                <input
                  type="text"
                  name="floor"
                  defaultValue={selectedRoom?.floor}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue={selectedRoom?.capacity}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              {selectedRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign Patient</label>
                  <select
                    name="patient_id"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="">Select Patient</option>
                    {availablePatients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.patient_name} ({patient.medical_record_number})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={selectedRoom?.active ?? true}
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
                  {selectedRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}