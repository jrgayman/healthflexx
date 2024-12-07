import React from 'react';

export default function AdherenceStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">Total Doses</div>
        <div className="text-2xl font-bold text-gray-900">{stats.total_doses}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">Doses Taken</div>
        <div className="text-2xl font-bold text-green-600">{stats.doses_taken}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">Doses Missed</div>
        <div className="text-2xl font-bold text-red-600">{stats.doses_missed}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">Doses Late</div>
        <div className="text-2xl font-bold text-yellow-600">{stats.doses_late}</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-sm text-gray-500">Adherence Rate</div>
        <div className="text-2xl font-bold text-primary">{stats.adherence_rate}%</div>
      </div>
    </div>
  );
}