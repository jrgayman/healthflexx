import React from 'react';

export default function SessionColumnTotals({ records, timeSlot }) {
  // Filter records for this time slot
  const slotRecords = records.filter(r => r.scheduled_time === timeSlot);
  
  // Count total non-pending records
  const totalNonPending = slotRecords.filter(r => r.status !== 'pending').length;
  
  if (totalNonPending === 0) return null;

  // Calculate statistics
  const successful = slotRecords.filter(r => r.status === 'taken').length;
  const overtaken = slotRecords.filter(r => r.status === 'overtaken').length;
  const missed = slotRecords.filter(r => r.status === 'missed').length;

  return (
    <div className="text-xs text-gray-500 space-y-1 mt-1">
      <div className="text-green-600">
        Successful: {successful}/{totalNonPending}
      </div>
      <div className="text-orange-600">
        Overtaken: {overtaken}/{totalNonPending}
      </div>
      <div className="text-red-600">
        Missed: {missed}/{totalNonPending}
      </div>
    </div>
  );
}