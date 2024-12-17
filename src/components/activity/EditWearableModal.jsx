import React, { useState } from 'react';

export default function EditWearableModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentMacAddress = '', 
  currentBatteryLevel = 0 
}) {
  const [macAddress, setMacAddress] = useState(currentMacAddress);
  const [batteryLevel, setBatteryLevel] = useState(currentBatteryLevel);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        mac_address: macAddress || null,
        battery_level: parseInt(batteryLevel) || 0
      });
      onClose();
    } catch (error) {
      console.error('Error saving wearable:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Wearable Device</h2>
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
            <label className="block text-sm font-medium text-gray-700">MAC Address</label>
            <input
              type="text"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value)}
              pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
              placeholder="XX:XX:XX:XX:XX:XX"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            <p className="mt-1 text-sm text-gray-500">Format: XX:XX:XX:XX:XX:XX</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Battery Level (%)</label>
            <input
              type="number"
              value={batteryLevel}
              onChange={(e) => setBatteryLevel(e.target.value)}
              min="0"
              max="100"
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}