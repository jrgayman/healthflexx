import React from 'react';
import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export default function StatusButton({ 
  status, 
  count = 0, 
  time, 
  scheduledDate, 
  scheduledTime, 
  timezone = 'America/New_York' 
}) {
  const statusColors = {
    pending: 'bg-gray-200 text-gray-700',
    taken: 'bg-green-500 text-white',
    missed: 'bg-red-500 text-white',
    overtaken: 'bg-orange-500 text-white'
  };

  // Format time display
  const getTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  // If taken or overtaken, show count and time
  if ((status === 'taken' || status === 'overtaken') && time) {
    const localTime = utcToZonedTime(parseISO(time), timezone);
    const formattedTime = format(localTime, 'h:mm a');
    const displayStatus = count > 1 ? 'overtaken' : status;
    const displayCount = count > 0 ? count : 1;

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${statusColors[displayStatus]}`}>
        {displayCount} - {formattedTime}
      </div>
    );
  }

  // For pending or missed status, show scheduled time
  if ((status === 'pending' || status === 'missed') && scheduledTime) {
    const formattedTime = getTimeDisplay(scheduledTime);
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${statusColors[status]}`}>
        0 - {formattedTime}
      </div>
    );
  }

  // Default circle display for other cases
  return (
    <div className={`h-6 w-6 rounded-full ${statusColors[status]}`} />
  );
}