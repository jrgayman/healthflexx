import React from 'react';
import { format, parseISO } from 'date-fns';

export default function StatusButton({ status, count = 0, time }) {
  const statusColors = {
    pending: 'bg-gray-200 text-gray-700',
    taken: 'bg-green-500 text-white',
    missed: 'bg-red-500 text-white',
    overtaken: 'bg-orange-500 text-white'
  };

  // If taken or overtaken, show count and time
  if ((status === 'taken' || status === 'overtaken') && time) {
    const formattedTime = format(parseISO(time), 'h:mm a');
    const displayStatus = count > 1 ? 'overtaken' : status;
    const displayCount = count > 0 ? count : 1;

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${statusColors[displayStatus]}`}>
        {displayCount} - {formattedTime}
      </div>
    );
  }

  // For other statuses, show simple circle
  return (
    <div className={`h-6 w-6 rounded-full ${statusColors[status]}`} />
  );
}