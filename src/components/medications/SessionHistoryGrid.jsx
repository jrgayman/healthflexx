import React from 'react';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import StatusButton from './StatusButton';
import SessionHistoryStats from './SessionHistoryStats';

export default function SessionHistoryGrid({ session, trackingRecords }) {
  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Session not found</p>
      </div>
    );
  }

  // Get all dates in the session
  const sessionDates = eachDayOfInterval({
    start: parseISO(session.start_date),
    end: parseISO(session.end_date)
  });

  // Group records by date and time
  const recordsByDate = trackingRecords.reduce((acc, record) => {
    const dateKey = format(parseISO(record.scheduled_date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    acc[dateKey][record.scheduled_time] = record;
    return acc;
  }, {});

  const TIME_SLOTS = [
    { time: '08:00:00', label: 'Morning', mac: session.morning_mac },
    { time: '12:00:00', label: 'Noon', mac: session.noon_mac },
    { time: '16:00:00', label: 'Afternoon', mac: session.afternoon_mac },
    { time: '20:00:00', label: 'Evening', mac: session.evening_mac }
  ].filter(slot => slot.mac);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Session History</h3>
        <div className="text-sm text-gray-500">
          {format(parseISO(session.start_date), 'MMM d, yyyy')} - {format(parseISO(session.end_date), 'MMM d, yyyy')}
        </div>
      </div>

      <SessionHistoryStats records={trackingRecords} />

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-10">
                Day
              </th>
              {TIME_SLOTS.map(slot => (
                <th key={slot.time} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>{slot.label}</div>
                  <div className="text-xs font-normal text-gray-400">MAC: {slot.mac}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessionDates.map((date, index) => (
              <tr key={date.toISOString()}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <span>Day {index + 1}</span>
                    <span className="text-gray-500">
                      {format(date, 'M/d/yy')}
                    </span>
                  </div>
                </td>
                {TIME_SLOTS.map(slot => {
                  const record = recordsByDate[format(date, 'yyyy-MM-dd')]?.[slot.time];
                  return (
                    <td key={`${date.toISOString()}-${slot.time}`} className="px-6 py-4 whitespace-nowrap">
                      <StatusButton
                        status={record?.status || 'pending'}
                        count={record?.dose_count}
                        time={record?.taken_at}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
          <span>Taken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-orange-500"></div>
          <span>Overtaken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-red-500"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-gray-200"></div>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}