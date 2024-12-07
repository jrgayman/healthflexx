import React from 'react';
import { format } from 'date-fns';

export default function AdherenceGrid({ schedule, adherenceData }) {
  if (!schedule?.time_slots?.length) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No schedule times configured.</p>
      </div>
    );
  }

  // Ensure time_slots is always an array
  const timeSlots = Array.isArray(schedule.time_slots) 
    ? schedule.time_slots.sort() 
    : [schedule.time_slots];

  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();

  const getStatusForSlot = (date, timeSlot) => {
    const record = adherenceData.find(r => 
      format(new Date(r.scheduled_date), 'yyyy-MM-dd') === date &&
      r.time_slot === timeSlot
    );
    return record?.status || 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'bg-green-500';
      case 'missed': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10">
                Time
              </th>
              {dates.map(date => (
                <th key={date} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {format(new Date(date), 'MMM d')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-white z-10">
                  {timeSlot}
                </td>
                {dates.map(date => {
                  const status = getStatusForSlot(date, timeSlot);
                  return (
                    <td key={`${date}-${timeSlot}`} className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className={`h-4 w-4 rounded-full ${getStatusColor(status)}`}
                        title={`${format(new Date(date), 'MMM d')} ${timeSlot} - ${status}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
            <span>Taken</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
            <span>Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-red-500"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-gray-300"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}