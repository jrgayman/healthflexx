import React from 'react';

export default function SessionColumnTotals({ records, timeSlot }) {
  // Filter records for this time slot
  const slotRecords = records.filter(r => r.scheduled_time === timeSlot);
  
  // Calculate statistics
  const total = 30; // Total possible doses for the session
  const taken = slotRecords.filter(r => r.status === 'taken').length;
  const overtaken = slotRecords.filter(r => r.status === 'overtaken').length;
  const missed = slotRecords.filter(r => r.status === 'missed').length;
  const pending = total - (taken + overtaken + missed);

  return (
    <div className="text-xs text-gray-500 space-y-1 mt-1">
      <div className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md mb-2">
        Pending: {pending}/{total}
      </div>
      <div className="space-y-1">
        <div className="text-green-600">
          Taken: {taken}/{total}
        </div>
        <div className="text-orange-600">
          Overtaken: {overtaken}/{total}
        </div>
        <div className="text-red-600">
          Missed: {missed}/{total}
        </div>
      </div>
    </div>
  );
}