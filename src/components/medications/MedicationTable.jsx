import React from 'react';

export default function MedicationTable({ medications }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generic Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Form</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Strength</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NDC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {medications.map((med) => (
              <tr key={med.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{med.brand_name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{med.generic_name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{med.manufacturer}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{med.pharm_class}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{med.dosage_form}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{med.strength}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{med.route}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{med.ndc_code}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}