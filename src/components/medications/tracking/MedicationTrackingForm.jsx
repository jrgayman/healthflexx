import React from 'react';
import { format } from 'date-fns';
import useTrackingForm from '../../../hooks/useTrackingForm';
import StatusSelect from './StatusSelect';
import NotesField from './NotesField';
import ScheduledTimeDisplay from './ScheduledTimeDisplay';

export default function MedicationTrackingForm({ record, onClose, onUpdate }) {
  const {
    status,
    notes,
    isSubmitting,
    handleStatusChange,
    handleNotesChange,
    handleSubmit
  } = useTrackingForm(record, onClose, onUpdate);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-labelledby="update-status-title"
      aria-hidden="false"
    >
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 id="update-status-title" className="text-xl font-bold text-gray-900">
            Update Status
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close dialog"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ScheduledTimeDisplay 
            date={record?.scheduled_date}
            time={record?.scheduled_time}
          />

          <StatusSelect 
            value={status}
            onChange={handleStatusChange}
          />

          <NotesField 
            value={notes}
            onChange={handleNotesChange}
          />

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