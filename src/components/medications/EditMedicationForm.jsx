import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function EditMedicationForm({ medication, onClose, onUpdate }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      
      const updates = {
        dosage: formData.get('dosage'),
        frequency: formData.get('frequency'),
        instructions: formData.get('instructions'),
        active: formData.get('active') === 'on'
      };

      const { error } = await supabase
        .from('patient_medications')
        .update(updates)
        .eq('id', medication.id);

      if (error) throw error;

      toast.success('Medication updated successfully');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating medication:', error);
      toast.error('Failed to update medication');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Medication</h2>
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
            <label className="block text-sm font-medium text-gray-700">Medication</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium text-gray-900">
                {medication.medications?.brand_name}
              </div>
              <div className="text-sm text-gray-500">
                {medication.medications?.generic_name}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dosage</label>
            <input
              type="text"
              name="dosage"
              defaultValue={medication.dosage}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Frequency</label>
            <select
              name="frequency"
              defaultValue={medication.frequency}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Four times daily">Four times daily</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea
              name="instructions"
              defaultValue={medication.instructions}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Special instructions for taking this medication..."
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="active"
                defaultChecked={medication.active}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
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