import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AddMedicationModal({ isOpen, onClose, patientId, onMedicationAdded }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (term) => {
    if (!term) {
      setMedications([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('active', true)
        .or(`brand_name.ilike.%${term}%,generic_name.ilike.%${term}%`)
        .order('brand_name')
        .limit(10);

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error searching medications:', error);
      toast.error('Failed to search medications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMedication) {
      toast.error('Please select a medication');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.target);
      
      const medicationData = {
        user_id: patientId,
        medication_id: selectedMedication.id,
        dosage: formData.get('dosage'),
        frequency: formData.get('frequency'),
        instructions: formData.get('instructions'),
        active: true
      };

      const { error } = await supabase
        .from('patient_medications')
        .insert([medicationData]);

      if (error) throw error;

      toast.success('Medication added successfully');
      onMedicationAdded?.();
      onClose();
    } catch (error) {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Medication</h2>
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
            <label className="block text-sm font-medium text-gray-700">Search Medication</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                  setSelectedMedication(null);
                }}
                placeholder="Search by name..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {loading && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            {medications.length > 0 && !selectedMedication && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                {medications.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => {
                      setSelectedMedication(med);
                      setSearchTerm(`${med.brand_name} (${med.generic_name})`);
                      setMedications([]);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:outline-none"
                  >
                    <div className="font-medium text-gray-900">{med.brand_name}</div>
                    <div className="text-sm text-gray-500">{med.generic_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedMedication && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  required
                  placeholder="e.g., 10mg"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  name="frequency"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="">Select Frequency</option>
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
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Special instructions for taking this medication..."
                />
              </div>
            </>
          )}

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
              disabled={isSubmitting || !selectedMedication}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}