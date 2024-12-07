import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import EditMedicationForm from './EditMedicationForm';
import toast from 'react-hot-toast';

export default function MedicationList({ medications, onUpdate }) {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  if (!medications?.length) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No medications assigned</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-end p-4 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Print Medications
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {medications.map((med) => (
                <tr key={med.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {med.medications?.brand_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {med.medications?.generic_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{med.dosage}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{med.frequency}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{med.instructions || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      med.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {med.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right print:hidden">
                    <button
                      onClick={() => {
                        setSelectedMedication(med);
                        setIsEditing(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && selectedMedication && (
        <EditMedicationForm
          medication={selectedMedication}
          onClose={() => {
            setIsEditing(false);
            setSelectedMedication(null);
          }}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}