import React from 'react';

export default function SessionHistoryStats({ records }) {
  // Filter out pending records for calculations
  const nonPendingRecords = records.filter(r => r.status !== 'pending');
  const totalNonPending = nonPendingRecords.length;

  // Calculate statistics
  const successful = records.filter(r => r.status === 'taken').length;
  const overtaken = records.filter(r => r.status === 'overtaken').length;
  const missed = records.filter(r => r.status === 'missed').length;

  // Calculate percentages
  const successfulPercent = totalNonPending ? Math.round((successful / totalNonPending) * 100) : 0;
  const overtakenPercent = totalNonPending ? Math.round((overtaken / totalNonPending) * 100) : 0;
  const missedPercent = totalNonPending ? Math.round((missed / totalNonPending) * 100) : 0;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-500">Total Completed</div>
        <div className="text-xl font-semibold text-gray-900">{totalNonPending}</div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-500">Successful Doses</div>
        <div className="text-xl font-semibold text-green-600">
          {successful}/{totalNonPending}
        </div>
        <div className="text-sm text-gray-500">{successfulPercent}%</div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-500">Overtaken Doses</div>
        <div className="text-xl font-semibold text-orange-600">
          {overtaken}/{totalNonPending}
        </div>
        <div className="text-sm text-gray-500">{overtakenPercent}%</div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-500">Missed Doses</div>
        <div className="text-xl font-semibold text-red-600">
          {missed}/{totalNonPending}
        </div>
        <div className="text-sm text-gray-500">{missedPercent}%</div>
      </div>
    </div>
  );
}