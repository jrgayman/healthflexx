import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import TimezoneSelect from '../medications/TimezoneSelect';
import { TIME_SLOTS } from '../../constants/medicationSchedule';
import toast from 'react-hot-toast';

export default function GlobalPatientSettings({ patient, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [medicationTimes, setMedicationTimes] = useState(
    patient.medication_times || TIME_SLOTS.map(slot => ({
      id: slot.id,
      label: slot.label,
      time: slot.defaultTime,
      enabled: true
    }))
  );

  const handleTimezoneChange = async (newTimezone) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ timezone: newTimezone })
        .eq('id', patient.id);

      if (error) throw error;
      onUpdate?.();
      toast.success('Timezone updated successfully');
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast.error('Failed to update timezone');
    } finally {
      setSaving(false);
    }
  };

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
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 text-primary hover:text-primary-dark flex items-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
        Global Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Global Patient Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-8">
              {/* Timezone Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Timezone</h3>
                <div className="max-w-xs">
                  <TimezoneSelect 
                    value={patient.timezone || 'America/New_York'}
                    onChange={handleTimezoneChange}
                  />
                  {saving && (
                    <p className="mt-1 text-sm text-gray-500">Saving...</p>
                  )}
                </div>
              </div>

              {/* Medication Schedule Settings */}
              <div className="border-t border-gray-200 pt-8">
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
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}