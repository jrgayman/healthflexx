import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';

export default function TakeMedicationModal({ isOpen, onClose, patientId, scheduleId, onMedicationTaken }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && patientId && scheduleId) {
      fetchSchedule();
    }
  }, [isOpen, patientId, scheduleId]);

  async function fetchSchedule() {
    try {
      const { data, error } = await supabase
        .from('patient_medication_schedule_details')
        .select('*')
        .eq('schedule_id', scheduleId)
        .single();

      if (error) throw error;
      setSchedule(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const now = new Date();
      const record = {
        schedule_id: scheduleId,
        scheduled_date: format(now, 'yyyy-MM-dd'),
        time_slot: format(now, 'HH:mm:ss'),
        taken_at: now.toISOString(),
        status: 'taken',
        notes: formData.get('notes')
      };

      const { error } = await supabase
        .from('medication_adherence_records')
        .insert([record]);

      if (error) throw error;

      onMedicationTaken();
      onClose();
    } catch (error) {
      console.error('Error recording medication:', error);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Take Medication</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {schedule && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Medication</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <div className="text-sm font-medium text-gray-900">{schedule.brand_name}</div>
                <div className="text-sm text-gray-500">{schedule.generic_name}</div>
                <div className="text-sm text-gray-500 mt-1">{schedule.frequency_name}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea
                name="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Any additional notes about this dose..."
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
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
              >
                Record Medication
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}