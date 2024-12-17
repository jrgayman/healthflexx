import React, { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { TIME_SLOTS } from '../../constants/medicationSchedule';
import toast from 'react-hot-toast';

export default function AddMissedDosageModal({ isOpen, onClose, sessionId, onDosageAdded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0].time);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: session, error: sessionError } = await supabase
        .from('medication_sessions')
        .select('start_date')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Calculate the date based on selected day
      const date = new Date(session.start_date);
      date.setDate(date.getDate() + (selectedDay - 1));
      const formattedDate = format(date, 'yyyy-MM-dd');

      // Get existing record
      const { data: existingRecord, error: recordError } = await supabase
        .from('medication_tracking_records')
        .select('status, dose_count')
        .eq('session_id', sessionId)
        .eq('scheduled_date', formattedDate)
        .eq('scheduled_time', selectedTime)
        .single();

      if (recordError && recordError.code !== 'PGRST116') throw recordError;

      const now = new Date();
      const updates = {
        status: existingRecord?.status === 'taken' ? 'overtaken' : 'taken',
        taken_at: now.toISOString(),
        dose_count: (existingRecord?.dose_count || 0) + 1,
        notes: notes || null
      };

      const { error: updateError } = await supabase
        .from('medication_tracking_records')
        .update(updates)
        .eq('session_id', sessionId)
        .eq('scheduled_date', formattedDate)
        .eq('scheduled_time', selectedTime);

      if (updateError) throw updateError;

      toast.success('Dosage recorded successfully');
      onDosageAdded?.();
      onClose();
    } catch (error) {
      console.error('Error recording dosage:', error);
      toast.error('Failed to record dosage');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add Missed Dosage</h2>
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
            <label className="block text-sm font-medium text-gray-700">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              {Array.from({ length: 30 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Day {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot.time} value={slot.time}>
                  {slot.label} ({format(new Date(`2000-01-01T${slot.time}`), 'h:mm a')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Add any notes about this missed dose..."
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
              {isSubmitting ? 'Recording...' : 'Record Dosage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}