import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import TimezoneSelect from '../medications/TimezoneSelect';
import toast from 'react-hot-toast';

export default function PatientTimezone({ patient, onUpdate }) {
  const [saving, setSaving] = useState(false);

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

  return (
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
  );
}