import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import RoomGrid from './RoomGrid';

export default function BuildingList({ buildingId, organizationId, buildings, onUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [expandedBuildingId, setExpandedBuildingId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expandedBuildingId) {
      fetchRooms(expandedBuildingId);
    }
  }, [expandedBuildingId]);

  async function fetchRooms(buildingId) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          patients!inner (
            id,
            medical_record_number,
            healthcare_provider_id,
            users (
              id,
              name
            )
          )
        `)
        .eq('building_id', buildingId)
        .eq('patients.healthcare_provider_id', organizationId)
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

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const buildingData = {
      healthcare_provider_id: organizationId,
      name: formData.get('name'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip: formData.get('zip'),
      phone: formData.get('phone'),
      active: formData.get('active') === 'on'
    };

    try {
      let error;
      if (selectedBuilding) {
        ({ error } = await supabase
          .from('buildings')
          .update(buildingData)
          .eq('id', selectedBuilding.id));
      } else {
        ({ error } = await supabase
          .from('buildings')
          .insert([buildingData]));
      }

      if (error) throw error;

      toast.success(selectedBuilding ? 'Building updated!' : 'Building added!');
      setIsModalOpen(false);
      setSelectedBuilding(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving building:', error);
      toast.error('Error saving building');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this building? All rooms will also be deleted.')) return;

    try {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Building deleted!');
      onUpdate();
    } catch (error) {
      console.error('Error deleting building:', error);
      toast.error('Failed to delete building');
    }
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold text-gray-900">Buildings</h4>
        <button
          onClick={() => {
            setSelectedBuilding(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-3 py-1 rounded-lg hover:bg-primary-dark text-sm"
        >
          Add Building
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {buildings.map((building) => (
                <React.Fragment key={building.id}>
                  <tr className={expandedBuildingId === building.id ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedBuildingId(expandedBuildingId === building.id ? null : building.id)}
                        className="flex items-center text-left w-full"
                      >
                        <svg
                          className={`h-5 w-5 mr-2 transform transition-transform ${
                            expandedBuildingId === building.id ? 'rotate-90' : ''
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-sm font-medium text-gray-900">{building.name}</div>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{building.address}</div>
                      <div className="text-sm text-gray-500">
                        {[building.city, building.state, building.zip].filter(Boolean).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{building.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        building.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {building.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => {
                          setSelectedBuilding(building);
                          setIsModalOpen(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(building.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedBuildingId === building.id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50">
                        <RoomGrid
                          buildingId={building.id}
                          rooms={rooms}
                          onUpdate={() => fetchRooms(building.id)}
                          loading={loading}
                          providerId={organizationId}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Building Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedBuilding ? 'Edit Building' : 'Add Building'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedBuilding(null);
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
                  defaultValue={selectedBuilding?.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={selectedBuilding?.address}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={selectedBuilding?.city}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={selectedBuilding?.state}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    name="zip"
                    defaultValue={selectedBuilding?.zip}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={selectedBuilding?.phone}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={selectedBuilding?.active ?? true}
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
                    setSelectedBuilding(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  {selectedBuilding ? 'Update Building' : 'Add Building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}