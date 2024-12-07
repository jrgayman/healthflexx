import React from 'react';
import { format } from 'date-fns';

export default function ScheduledTimeDisplay({ date, time }) {
  if (!date || !time) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700">Scheduled Time</label>
        <div className="mt-1 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-500">
            Scheduled time not available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Scheduled Time</label>
      <div className="mt-1 p-3 bg-gray-50 rounded-md">
        <div className="text-sm font-medium text-gray-900">
          {format(new Date(date), 'MMM d, yyyy')} at{' '}
          {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
        </div>
      </div>
    </div>
  );
}