import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AddMedicationSchedule({ isOpen, onClose, patientId, onScheduleAdded }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [frequency, setFrequency] = useState('qd');
  const [times, setTimes] = useState(['09:00']);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const frequencies = [
    { code: 'qd', name: 'Once daily', max: 1 },
    { code: 'bid', name: 'Twice daily', max: 2 },
    { code: 'tid', name: 'Three times daily', max: 3 },
    { code: 'qid', name: 'Four times daily', max: 4 }
  ];

  async function searchMedications(term) {
    if (!term) {
      setMedications([]);
      return;
    }

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
    }
  }

  function handleFrequencyChange(e) {
    const newFrequency = e.target.value;
    setFrequency(newFrequency);
    
    const maxTimes = frequencies.find(f => f.code === newFrequency)?.max || 1;
    setTimes(Array(maxTimes).fill('09:00'));
  }

  function handleTimeChange(index, value) {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('patient_medication_schedules')
        .insert([{
          user_id: patientId,
          medication_id: selectedMedication.id,
          frequency_code: frequency,
          start_date: new Date().toISOString().split('T')[0],
          active: true
        }])
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Add time slots
      const { error: timesError } = await supabase
        .from('schedule_time_slots')
        .insert(times.map(time => ({
          schedule_id: schedule.id,
          time_slot: time
        })));

      if (timesError) throw timesError;

      // Generate initial adherence records
      const { error: recordsError } = await supabase.rpc(
        'generate_adherence_records',
        { 
          schedule_id: schedule.id,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      );

      if (recordsError) throw recordsError;

      toast.success('Medication schedule added successfully');
      onScheduleAdded?.();
      onClose();
    } catch (error) {
      console.error('Error adding medication schedule:', error);
      toast.error('Failed to add medication schedule');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Medication Schedule</h2>
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
                  searchMedications(e.target.value);
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
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={frequency}
                  onChange={handleFrequencyChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  {frequencies.map(f => (
                    <option key={f.code} value={f.code}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Times</label>
                <div className="space-y-2">
                  {times.map((time, index) => (
                    <input
                      key={index}
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    />
                  ))}
                </div>
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
              {isSubmitting ? 'Adding...' : 'Add Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}