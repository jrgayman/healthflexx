import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function LTEHubManager({ patientId }) {
  const [hubs, setHubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchHubs();
    }
  }, [patientId]);

  async function fetchHubs() {
    try {
      const { data, error } = await supabase
        .from('lte_hubs')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at');

      if (error) throw error;
      setHubs(data || []);
    } catch (error) {
      console.error('Error fetching LTE hubs:', error);
      toast.error('Failed to load LTE hubs');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const macAddress = formData.get('mac_address');

      // Validate MAC address format
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macRegex.test(macAddress)) {
        throw new Error('Invalid MAC address format');
      }

      // Check if we've reached the limit
      if (!editingHub && hubs.length >= 2) {
        throw new Error('Maximum of 2 LTE hubs allowed');
      }

      const hubData = {
        mac_address: macAddress,
        patient_id: patientId,
        active: true
      };

      let error;
      if (editingHub) {
        ({ error } = await supabase
          .from('lte_hubs')
          .update(hubData)
          .eq('id', editingHub.id));
      } else {
        ({ error } = await supabase
          .from('lte_hubs')
          .insert([hubData]));
      }

      if (error) throw error;

      toast.success(editingHub ? 'LTE hub updated' : 'LTE hub added');
      setIsModalOpen(false);
      setEditingHub(null);
      fetchHubs();
    } catch (error) {
      console.error('Error saving LTE hub:', error);
      toast.error(error.message || 'Failed to save LTE hub');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={hubs.length >= 2}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + LTE Hub
        </button>
        {hubs.length >= 2 && (
          <span className="text-sm text-gray-500">Maximum of 2 LTE hubs reached</span>
        )}
      </div>

      {hubs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          {hubs.map((hub) => (
            <div key={hub.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                <span className="font-mono text-sm">{hub.mac_address}</span>
              </div>
              <button
                onClick={() => {
                  setEditingHub(hub);
                  setIsModalOpen(true);
                }}
                className="text-primary hover:text-primary-dark"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingHub ? 'Edit LTE Hub' : 'Add LTE Hub'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingHub(null);
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
                <label className="block text-sm font-medium text-gray-700">MAC Address</label>
                <input
                  type="text"
                  name="mac_address"
                  defaultValue={editingHub?.mac_address}
                  pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                  placeholder="XX:XX:XX:XX:XX:XX"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Format: XX:XX:XX:XX:XX:XX</p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingHub(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingHub ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}