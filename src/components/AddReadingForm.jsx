import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { uploadMedicalFile } from '../lib/fileUtils';
import toast from 'react-hot-toast';

export default function AddReadingForm({ 
  isOpen, 
  onClose, 
  patientId, 
  readingTypes,
  onReadingAdded 
}) {
  const [selectedType, setSelectedType] = useState('');
  const [numericValue, setNumericValue] = useState('');
  const [systolicValue, setSystolicValue] = useState('');
  const [diastolicValue, setDiastolicValue] = useState('');
  const [textValue, setTextValue] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedReadingType = readingTypes.find(type => type.id === selectedType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const readingData = {
        user_id: patientId,
        reading_type_id: selectedType,
        reading_date: new Date().toISOString()
      };

      // Handle file upload if needed
      if (file && ['image', 'audio', 'pdf', 'media'].includes(selectedReadingType?.value_type)) {
        const filePath = await uploadMedicalFile(file, patientId, selectedReadingType.code);
        readingData.file_path = filePath;
        readingData.file_type = file.type;
        readingData.file_size = file.size;
        readingData.file_name = file.name;
      }

      // Set value based on reading type
      if (selectedReadingType?.value_type === 'numeric') {
        readingData.numeric_value = parseFloat(numericValue);
      } else if (selectedReadingType?.value_type === 'blood_pressure') {
        readingData.systolic_value = parseFloat(systolicValue);
        readingData.diastolic_value = parseFloat(diastolicValue);
      } else if (selectedReadingType?.value_type === 'text') {
        readingData.text_value = textValue;
      }

      // Add notes if provided
      if (notes) {
        readingData.notes = notes;
      }

      const { error: readingError } = await supabase
        .from('medical_readings')
        .upsert([readingData], {
          onConflict: 'user_id,reading_type_id,reading_date',
          ignoreDuplicates: false
        });

      if (readingError) throw readingError;

      toast.success('Reading added successfully');
      onReadingAdded();
      handleClose();
    } catch (error) {
      console.error('Error adding reading:', error);
      toast.error(error.message || 'Failed to add reading');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedType('');
    setNumericValue('');
    setSystolicValue('');
    setDiastolicValue('');
    setTextValue('');
    setFile(null);
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Reading</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Reading Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Select Type</option>
              {readingTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>

          {selectedReadingType?.value_type === 'numeric' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Value {selectedReadingType.unit ? `(${selectedReadingType.unit})` : ''}
              </label>
              <input
                type="number"
                step="any"
                value={numericValue}
                onChange={(e) => setNumericValue(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          )}

          {selectedReadingType?.value_type === 'blood_pressure' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Systolic (mmHg)
                </label>
                <input
                  type="number"
                  step="1"
                  value={systolicValue}
                  onChange={(e) => setSystolicValue(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Diastolic (mmHg)
                </label>
                <input
                  type="number"
                  step="1"
                  value={diastolicValue}
                  onChange={(e) => setDiastolicValue(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>
            </div>
          )}

          {selectedReadingType?.value_type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
          )}

          {['image', 'audio', 'pdf', 'media'].includes(selectedReadingType?.value_type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                required
                accept={
                  selectedReadingType?.value_type === 'image' ? 'image/*' :
                  selectedReadingType?.value_type === 'audio' ? 'audio/*' :
                  selectedReadingType?.value_type === 'pdf' ? '.pdf' :
                  'image/*,video/*'
                }
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary-dark"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Optional notes about this reading..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}