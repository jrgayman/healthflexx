import React from 'react';
import { format } from 'date-fns';

export default function PatientMedicationGrid({ schedule, adherenceData }) {
  if (!schedule?.time_slots?.length) {
    return null;
  }

  const timeSlots = schedule.time_slots.sort();
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
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
      <div className="p-4 bg-gray-50 border-b">
        <h3 className="text-lg font-medium text-gray-900">
          {schedule.brand_name} ({schedule.frequency_name})
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {timeSlot}
                </td>
                {dates.map(date => {
                  const status = getStatusForSlot(date, timeSlot);
                  return (
                    <td key={`${date}-${timeSlot}`} className="px-6 py-4 whitespace-nowrap">
                      <div className={`h-4 w-4 rounded-full ${getStatusColor(status)}`} />
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