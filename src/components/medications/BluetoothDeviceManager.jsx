import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function BluetoothDeviceManager({ sessionId, timeSlot, onUpdate }) {
  const [device, setDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionId && timeSlot) {
      fetchDevice();
    }
  }, [sessionId, timeSlot]);

  async function fetchDevice() {
    try {
      const { data, error } = await supabase
        .from('bluetooth_devices')
        .select('*')
        .eq('session_id', sessionId)
        .eq('time_slot', timeSlot)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setDevice(data);
    } catch (error) {
      console.error('Error fetching BT device:', error);
      toast.error('Failed to load BT device');
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

      const deviceData = {
        session_id: sessionId,
        time_slot: timeSlot,
        mac_address: macAddress
      };

      let error;
      if (device) {
        ({ error } = await supabase
          .from('bluetooth_devices')
          .update(deviceData)
          .eq('id', device.id));
      } else {
        ({ error } = await supabase
          .from('bluetooth_devices')
          .insert([deviceData]));
      }

      if (error) throw error;

      toast.success(device ? 'BT device updated' : 'BT device added');
      setIsModalOpen(false);
      fetchDevice();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving BT device:', error);
      toast.error(error.message || 'Failed to save BT device');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {device ? (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{device.mac_address}</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-primary hover:text-primary-dark ml-2"
          >
            Edit
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-primary hover:text-primary-dark"
        >
          + BT Device
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {device ? 'Edit BT Device' : 'Add BT Device'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  defaultValue={device?.mac_address}
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (device ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}