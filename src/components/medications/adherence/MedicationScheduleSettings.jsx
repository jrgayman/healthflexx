import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';

const DEFAULT_TIMES = [
  { id: 'morning', label: 'Morning', time: '08:00', enabled: true },
  { id: 'noon', label: 'Noon', time: '12:00', enabled: true },
  { id: 'afternoon', label: 'Afternoon', time: '16:00', enabled: true },
  { id: 'evening', label: 'Evening', time: '20:00', enabled: true }
];

export default function MedicationScheduleSettings({ patient, onUpdate }) {
  const [medicationTimes, setMedicationTimes] = useState(
    patient.medication_times || DEFAULT_TIMES
  );

  useEffect(() => {
    if (patient.medication_times) {
      setMedicationTimes(patient.medication_times);
    }
  }, [patient]);

  const handleTimeChange = async (id, newTime) => {
    const updatedTimes = medicationTimes.map(t => 
      t.id === id ? { ...t, time: newTime } : t
    );
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ medication_times: updatedTimes })
        .eq('id', patient.id);

      if (error) throw error;
      setMedicationTimes(updatedTimes);
      onUpdate?.();
      toast.success('Medication schedule updated');
    } catch (error) {
      console.error('Error updating medication times:', error);
      toast.error('Failed to update medication schedule');
    }
  };

  const handleTimeSlotToggle = async (id) => {
    const updatedTimes = medicationTimes.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    );
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ medication_times: updatedTimes })
        .eq('id', patient.id);

      if (error) throw error;
      setMedicationTimes(updatedTimes);
      onUpdate?.();
      toast.success('Medication schedule updated');
    } catch (error) {
      console.error('Error updating medication times:', error);
      toast.error('Failed to update medication schedule');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Default Medication Schedule</h3>
      <div className="space-y-4">
        {medicationTimes.map((slot) => (
          <div key={slot.id} className="flex items-center gap-4">
            <label className="flex items-center min-w-[120px]">
              <input
                type="checkbox"
                checked={slot.enabled}
                onChange={() => handleTimeSlotToggle(slot.id)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">{slot.label}</span>
            </label>
            <input
              type="time"
              value={slot.time}
              onChange={(e) => handleTimeChange(slot.id, e.target.value)}
              disabled={!slot.enabled}
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-500">
        These times will be used as defaults when starting new medication sessions.
      </p>
    </div>
  );
}