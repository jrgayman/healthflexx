import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function PatientDevices() {
  const { patient } = useOutletContext();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patient?.id) {
      fetchDevices();
    }
  }, [patient]);

  async function fetchDevices() {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select(`
          *,
          device_types (
            id,
            name,
            device_classifications (
              id,
              name
            )
          )
        `)
        .eq('user_id', patient.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading devices..." />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Assigned Devices</h2>
      
      {devices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {devices.map((device) => (
                <tr key={device.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {device.device_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {device.device_types?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {device.device_types?.device_classifications?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {device.serial_number || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {device.mac_address || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {device.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No devices assigned yet.</p>
      )}
    </div>
  );
}