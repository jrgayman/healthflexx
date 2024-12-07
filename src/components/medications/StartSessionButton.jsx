import React from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function StartSessionButton({ patientId, onSessionStarted }) {
  const handleStartSession = async () => {
    try {
      const { data: session, error } = await supabase
        .rpc('start_medication_session', {
          p_patient_id: patientId,
          p_start_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      toast.success('New session started');
      onSessionStarted?.();
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  return (
    <button
      onClick={handleStartSession}
      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
    >
      + Start New Session
    </button>
  );
}