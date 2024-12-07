```javascript
import { supabase } from './supabase';
import { format, addDays } from 'date-fns';

export async function fetchTrackingRecords(sessionId) {
  if (!sessionId) return [];
  
  const { data, error } = await supabase
    .from('medication_tracking_records')
    .select('*')
    .eq('session_id', sessionId)
    .order('scheduled_date')
    .order('scheduled_time');

  if (error) throw error;
  return data || [];
}

export async function updateTrackingRecord(recordId, updates) {
  if (!recordId) return false;

  const { error } = await supabase
    .from('medication_tracking_records')
    .update(updates)
    .eq('id', recordId);

  if (error) throw error;
  return true;
}

export async function startNewSession(patientId, startDate = new Date()) {
  if (!patientId) return null;

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from('medication_sessions')
    .insert([{
      patient_id: patientId,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(addDays(startDate, 29), 'yyyy-MM-dd'),
      active: true
    }])
    .select()
    .single();

  if (sessionError) throw sessionError;

  // Generate tracking records
  const timeSlots = ['08:00:00', '12:00:00', '16:00:00', '20:00:00'];
  const trackingRecords = [];

  for (let i = 0; i <= 29; i++) {
    const currentDate = format(addDays(startDate, i), 'yyyy-MM-dd');
    timeSlots.forEach(time => {
      trackingRecords.push({
        session_id: session.id,
        scheduled_date: currentDate,
        scheduled_time: time,
        status: 'pending',
        dose_count: 0
      });
    });
  }

  const { error: recordsError } = await supabase
    .from('medication_tracking_records')
    .insert(trackingRecords);

  if (recordsError) throw recordsError;

  return session;
}

export async function getSessionSummary(sessionId) {
  if (!sessionId) return null;

  const { data, error } = await supabase
    .from('medication_session_summary')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getCurrentSession(patientId) {
  if (!patientId) return null;

  const { data, error } = await supabase
    .from('medication_sessions')
    .select('*')
    .eq('patient_id', patientId)
    .eq('active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}
```