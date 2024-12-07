import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MedicationTrackingForm({ record, onClose, onUpdate }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(record?.status || 'pending');
  const [notes, setNotes] = useState(record?.notes || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!record?.id) {
        throw new Error('Invalid record');
      }

      const updates = {
        status,
        notes,
        taken_at: ['taken', 'late', 'overtaken'].includes(status) ? new Date().toISOString() : null,
        dose_count: status === 'overtaken' ? (record.dose_count || 0) + 1 : record.dose_count || 0
      };

      const { error } = await supabase
        .from('medication_tracking_records')
        .update(updates)
        .eq('id', record.id);

      if (error) throw error;

      toast.success('Status updated successfully');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
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
            <label className="block text-sm font-medium text-gray-700">Scheduled Time</label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md">
              <div className="text-sm font-medium text-gray-900">
                {format(new Date(record.scheduled_date), 'MMM d, yyyy')} at{' '}
                {format(new Date(`2000-01-01T${record.scheduled_time}`), 'h:mm a')}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="taken">Taken</option>
              <option value="missed">Missed</option>
              <option value="late">Late</option>
              <option value="overtaken">Overtaken</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Add any notes about this dose..."
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
              {isSubmitting ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}