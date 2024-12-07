import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function RoomGrid({ buildingId, providerId }) {
  const [rooms, setRooms] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  useEffect(() => {
    if (buildingId && providerId) {
      fetchRooms();
      fetchAvailablePatients();
    }
  }, [buildingId, providerId]);

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
          )
        `)
        .eq('building_id', buildingId)
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailablePatients() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, medical_record_number')
        .eq('healthcare_provider_id', providerId)
        .is('room_id', null);

      if (error) throw error;
      setAvailablePatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    }
  }

  async function handleCellEdit(room, field, value) {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ [field]: value })
        .eq('id', room.id);

      if (error) throw error;
      setEditingCell(null);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Failed to update room');
    }
  }

  async function handlePatientAssignment(roomId, userId) {
    try {
      if (userId) {
        // Assign patient to room
        const { error: assignError } = await supabase
          .from('users')
          .update({ room_id: roomId })
          .eq('id', userId);

        if (assignError) throw assignError;
      } else {
        // Get current patient in room
        const room = rooms.find(r => r.id === roomId);
        const currentPatient = room?.users?.[0];
        
        if (currentPatient) {
          // Unassign patient from room
          const { error: unassignError } = await supabase
            .from('users')
            .update({ room_id: null })
            .eq('id', currentPatient.id);

          if (unassignError) throw unassignError;
        }
      }

      toast.success(userId ? 'Patient assigned' : 'Patient unassigned');
      fetchRooms();
      fetchAvailablePatients();
    } catch (error) {
      console.error('Error managing patient assignment:', error);
      toast.error('Failed to manage patient assignment');
    }
  }

  async function handleBulkCreate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const startRoom = parseInt(formData.get('start_room'));
    const endRoom = parseInt(formData.get('end_room'));
    const floor = formData.get('floor') || null;
    const capacity = parseInt(formData.get('capacity')) || null;

    if (isNaN(startRoom) || isNaN(endRoom) || startRoom > endRoom) {
      toast.error('Invalid room number range');
      return;
    }

    try {
      const rooms = [];
      for (let i = startRoom; i <= endRoom; i++) {
        rooms.push({
          building_id: buildingId,
          room_number: i.toString().padStart(3, '0'),
          floor,
          capacity,
          active: true
        });
      }

      const { error } = await supabase
        .from('rooms')
        .insert(rooms);

      if (error) throw error;

      toast.success('Rooms created successfully!');
      setBulkModalOpen(false);
      fetchRooms();
    } catch (error) {
      console.error('Error creating rooms:', error);
      toast.error('Failed to create rooms');
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button
          onClick={() => setBulkModalOpen(true)}
          className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm"
        >
          Bulk Add Rooms
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4">
                    {editingCell === `${room.id}-room_number` ? (
                      <input
                        type="text"
                        defaultValue={room.room_number}
                        className="w-full rounded border-gray-300"
                        onBlur={(e) => handleCellEdit(room, 'room_number', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(room, 'room_number', e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:text-primary"
                        onClick={() => setEditingCell(`${room.id}-room_number`)}
                      >
                        {room.room_number}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingCell === `${room.id}-floor` ? (
                      <input
                        type="text"
                        defaultValue={room.floor}
                        className="w-full rounded border-gray-300"
                        onBlur={(e) => handleCellEdit(room, 'floor', e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(room, 'floor', e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:text-primary"
                        onClick={() => setEditingCell(`${room.id}-floor`)}
                      >
                        {room.floor || '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingCell === `${room.id}-capacity` ? (
                      <input
                        type="number"
                        defaultValue={room.capacity}
                        className="w-full rounded border-gray-300"
                        onBlur={(e) => handleCellEdit(room, 'capacity', parseInt(e.target.value))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCellEdit(room, 'capacity', parseInt(e.target.value));
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:text-primary"
                        onClick={() => setEditingCell(`${room.id}-capacity`)}
                      >
                        {room.capacity || '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {room.users?.[0] ? (
                      <div className="flex items-center justify-between">
                        <span>
                          {room.users[0].name} ({room.users[0].medical_record_number})
                        </span>
                        <button
                          onClick={() => handlePatientAssignment(room.id, null)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Unassign
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!room.users?.[0] && (
                      <select
                        onChange={(e) => handlePatientAssignment(room.id, e.target.value)}
                        className="w-full rounded border-gray-300"
                        value=""
                      >
                        <option value="">Select Patient</option>
                        {availablePatients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name} ({patient.medical_record_number})
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={room.active}
                        onChange={(e) => handleCellEdit(room, 'active', e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Add Rooms Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Bulk Add Rooms</h2>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleBulkCreate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Room #</label>
                  <input
                    type="number"
                    name="start_room"
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Room #</label>
                  <input
                    type="number"
                    name="end_room"
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Floor</label>
                <input
                  type="text"
                  name="floor"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  Create Rooms
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}