import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ProductForm({ 
  product = null, 
  deviceTypes, 
  onSave, 
  onClose 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const selectedDeviceType = deviceTypes.find(t => t.id === formData.get('device_type'));
      
      const productData = {
        device_type_id: formData.get('device_type'),
        device_name: selectedDeviceType?.name || 'Unknown Device',
        serial_number: formData.get('serial_number'),
        mac_address: formData.get('mac_address'),
        notes: formData.get('notes'),
        active: true
      };

      await onSave(productData);
      toast.success(product ? 'Device updated!' : 'Device added!');
      onClose();
    } catch (error) {
      console.error('Error saving device:', error);
      toast.error('Failed to save device');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Device Type</label>
        <select
          name="device_type"
          defaultValue={product?.device_type_id || ''}
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
          defaultValue={product?.serial_number}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">MAC Address</label>
        <input
          type="text"
          name="mac_address"
          defaultValue={product?.mac_address}
          pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
          placeholder="XX:XX:XX:XX:XX:XX"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
        <p className="mt-1 text-sm text-gray-500">Format: XX:XX:XX:XX:XX:XX</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          defaultValue={product?.notes}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
          {isSubmitting ? 'Saving...' : (product ? 'Update' : 'Add')}
        </button>
      </div>
    </form>
  );
}