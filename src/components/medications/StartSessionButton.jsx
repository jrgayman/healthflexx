import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import toast from 'react-hot-toast';

export default function StartSessionButton({ patientId, onSessionStarted }) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSession = async () => {
    if (!patientId || isStarting) return;
    setIsStarting(true);

    try {
      // Get patient's timezone and medication times
      const { data: patient, error: patientError } = await supabase
        .from('users')
        .select('timezone, medication_times')
        .eq('id', patientId)
        .single();

      if (patientError) throw patientError;

      // Get enabled time slots
      const timeSlots = patient.medication_times
        ?.filter(slot => slot.enabled)
        .map(slot => `${slot.time}:00`)
        || ['08:00:00', '12:00:00', '16:00:00', '20:00:00'];

      // Get current date in patient's timezone
      const timezone = patient.timezone || 'America/New_York';
      const startDate = format(new Date(), 'yyyy-MM-dd');

      // Start new session with timezone and time slots
      const { error } = await supabase.rpc('start_medication_session', {
        p_patient_id: patientId,
        p_start_date: startDate,
        p_timezone: timezone,
        p_time_slots: timeSlots
      });

      if (error) throw error;

      toast.success('New session started');
      onSessionStarted?.();
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <button
      onClick={handleStartSession}
      disabled={isStarting}
      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
    >
      {isStarting ? 'Starting...' : '+ Start New Session'}
    </button>
  );
}