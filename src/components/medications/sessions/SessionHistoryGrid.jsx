import React from 'react';
import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import StatusButton from '../StatusButton';
import { TIME_SLOTS } from '../../../constants/medicationSchedule';

export default function SessionHistoryGrid({ session, trackingRecords }) {
  if (!session || !trackingRecords?.length) {
    return null;
  }

  // Group records by date and time
  const recordsByDate = trackingRecords.reduce((acc, record) => {
    const dateKey = format(parseISO(record.scheduled_date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    acc[dateKey][record.scheduled_time] = record;
    return acc;
  }, {});

  // Get all dates in the session
  const sessionStartDate = parseISO(session.start_date);
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(sessionStartDate);
    date.setDate(sessionStartDate.getDate() + i);
    return format(date, 'yyyy-MM-dd');
  });

  // Calculate column totals
  const columnTotals = TIME_SLOTS.map(slot => {
    const slotRecords = trackingRecords.filter(r => r.scheduled_time === slot.time);
    return {
      total: slotRecords.length,
      taken: slotRecords.filter(r => r.status === 'taken').length,
      missed: slotRecords.filter(r => r.status === 'missed').length,
      overtaken: slotRecords.filter(r => r.status === 'overtaken').length,
      pending: slotRecords.filter(r => r.status === 'pending').length
    };
  });

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
              Day
            </th>
            {TIME_SLOTS.map((slot, index) => (
              <th key={slot.time} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div>{slot.label}</div>
                <div className="text-xs text-gray-500 space-y-1 mt-1">
                  <div className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mb-2">
                    Pending: {columnTotals[index].pending}/{columnTotals[index].total}
                  </div>
                  <div className="space-y-1">
                    <div className="text-green-600">
                      Taken: {columnTotals[index].taken}/{columnTotals[index].total}
                    </div>
                    <div className="text-orange-600">
                      Overtaken: {columnTotals[index].overtaken}/{columnTotals[index].total}
                    </div>
                    <div className="text-red-600">
                      Missed: {columnTotals[index].missed}/{columnTotals[index].total}
                    </div>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {days.map((dateStr, index) => (
            <tr key={dateStr}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-2">
                  <span>Day {index + 1}</span>
                  <span className="text-gray-500">
                    {format(parseISO(dateStr), 'M/d/yy')}
                  </span>
                </div>
              </td>
              {TIME_SLOTS.map(slot => {
                const record = recordsByDate[dateStr]?.[slot.time];
                return (
                  <td key={`${dateStr}-${slot.time}`} className="px-6 py-4 whitespace-nowrap">
                    <StatusButton
                      status={record?.status || 'pending'}
                      count={record?.dose_count}
                      time={record?.taken_at}
                      scheduledDate={dateStr}
                      scheduledTime={slot.time}
                      timezone={session.timezone}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}