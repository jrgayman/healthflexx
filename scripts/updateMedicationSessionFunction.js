import { supabase } from '../lib/supabase';

async function updateMedicationSessionFunction() {
  try {
    console.log('Updating medication session function...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing function
        DROP FUNCTION IF EXISTS start_medication_session(uuid, date);
        DROP FUNCTION IF EXISTS start_medication_session(uuid, date, text, text[]);

        -- Create new function with timezone and time slots support
        CREATE OR REPLACE FUNCTION start_medication_session(
          p_patient_id UUID,
          p_start_date DATE,
          p_timezone TEXT DEFAULT 'America/New_York',
          p_time_slots TEXT[] DEFAULT ARRAY['08:00:00', '12:00:00', '16:00:00', '20:00:00']::TEXT[]
        )
        RETURNS UUID AS $$
        DECLARE
          v_session_id UUID;
          v_end_date DATE;
        BEGIN
          -- Set previous session as inactive
          UPDATE medication_sessions
          SET active = false
          WHERE patient_id = p_patient_id AND active = true;

          -- Calculate end date (30 days from start)
          v_end_date := p_start_date + INTERVAL '29 days';

          -- Create new session
          INSERT INTO medication_sessions (
            patient_id,
            start_date,
            end_date,
            timezone,
            active
          ) VALUES (
            p_patient_id,
            p_start_date,
            v_end_date,
            p_timezone,
            true
          ) RETURNING id INTO v_session_id;

          -- Generate tracking records for each day and time slot
          INSERT INTO medication_tracking_records (
            session_id,
            scheduled_date,
            scheduled_time,
            status
          )
          SELECT 
            v_session_id,
            d::date,
            t::time without time zone,
            'pending'
          FROM generate_series(p_start_date, v_end_date, '1 day'::interval) d
          CROSS JOIN unnest(p_time_slots) t;

          RETURN v_session_id;
        END;
        $$ LANGUAGE plpgsql;

        -- Create function to mark missed doses
        CREATE OR REPLACE FUNCTION mark_missed_doses()
        RETURNS void AS $$
        BEGIN
          UPDATE medication_tracking_records
          SET status = 'missed'
          WHERE status = 'pending'
          AND (scheduled_date || ' ' || scheduled_time)::timestamp < NOW()
          AND session_id IN (
            SELECT id 
            FROM medication_sessions 
            WHERE active = true
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (error) throw error;
    console.log('Medication session function updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating medication session function:', error);
    return false;
  }
}

updateMedicationSessionFunction()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));