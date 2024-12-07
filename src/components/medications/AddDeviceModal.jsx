import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AddDeviceModal({ isOpen, onClose, patientId, onDeviceAdded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classifications, setClassifications] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedClassification, setSelectedClassification] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [filteredTypes, setFilteredTypes] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchDeviceData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedClassification) {
      setFilteredTypes(deviceTypes.filter(type => type.classification_id === selectedClassification));
      setSelectedType('');
    } else {
      setFilteredTypes([]);
      setSelectedType('');
    }
  }, [selectedClassification, deviceTypes]);

  async function fetchDeviceData() {
    try {
      // Fetch device classifications
      const { data: classData, error: classError } = await supabase
        .from('device_classifications')
        .select('*')
        .order('name');

      if (classError) throw classError;
      setClassifications(classData || []);

      // Fetch device types
      const { data: typeData, error: typeError } = await supabase
        .from('device_types')
        .select('*')
        .order('name');

      if (typeError) throw typeError;
      setDeviceTypes(typeData || []);
    } catch (error) {
      console.error('Error fetching device data:', error);
      toast.error('Failed to load device options');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const selectedDeviceType = deviceTypes.find(t => t.id === formData.get('device_type'));
      
      const deviceData = {
        device_type_id: formData.get('device_type'),
        device_name: selectedDeviceType?.name || 'Unknown Device',
        serial_number: formData.get('serial_number') || null,
        mac_address: formData.get('mac_address') || null,
        notes: formData.get('notes') || null,
        active: true,
        user_id: patientId
      };

      const { error } = await supabase
        .from('devices')
        .insert([deviceData]);

      if (error) throw error;

      toast.success('Device added successfully');
      onDeviceAdded?.();
      onClose();
    } catch (error) {
      console.error('Error adding device:', error);
      toast.error('Failed to add device');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Device</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Device Category</label>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Select Category</option>
              {classifications.map(classification => (
                <option key={classification.id} value={classification.id}>
                  {classification.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Device Type</label>
            <select
              name="device_type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              required
              disabled={!selectedClassification}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100"
            >
              <option value="">Select Type</option>
              {filteredTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number (Optional)</label>
            <input
              type="text"
              name="serial_number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">MAC Address (Optional)</label>
            <input
              type="text"
              name="mac_address"
              pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
              placeholder="XX:XX:XX:XX:XX:XX"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            <p className="mt-1 text-sm text-gray-500">Format: XX:XX:XX:XX:XX:XX</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Additional notes about this device..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}