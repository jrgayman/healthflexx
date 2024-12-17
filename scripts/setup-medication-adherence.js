import { supabase } from '../lib/supabase';

async function setupMedicationAdherence() {
  try {
    console.log('Setting up medication adherence system...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create medication sessions table
        CREATE TABLE IF NOT EXISTS medication_sessions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          schedule_id UUID NOT NULL REFERENCES patient_medication_schedules(id),
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_medication_sessions_schedule ON medication_sessions(schedule_id);
        CREATE INDEX IF NOT EXISTS idx_medication_sessions_dates ON medication_sessions(start_date, end_date);
        CREATE INDEX IF NOT EXISTS idx_medication_sessions_active ON medication_sessions(active);

        -- Update medication adherence records to link with sessions
        ALTER TABLE medication_adherence_records
        ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES medication_sessions(id);

        CREATE INDEX IF NOT EXISTS idx_med_adherence_session ON medication_adherence_records(session_id);

        -- Create function to start new medication session
        CREATE OR REPLACE FUNCTION start_medication_session(p_schedule_id UUID)
        RETURNS UUID AS $$
        DECLARE
          v_session_id UUID;
          v_start_date DATE;
          v_end_date DATE;
        BEGIN
          -- Set previous session as inactive
          UPDATE medication_sessions
          SET active = false
          WHERE schedule_id = p_schedule_id AND active = true;

          -- Calculate dates for new session
          v_start_date := CURRENT_DATE;
          v_end_date := v_start_date + INTERVAL '30 days';

          -- Create new session
          INSERT INTO medication_sessions (
            schedule_id,
            start_date,
            end_date,
            active
          ) VALUES (
            p_schedule_id,
            v_start_date,
            v_end_date,
            true
          ) RETURNING id INTO v_session_id;

          -- Generate adherence records for the session
          INSERT INTO medication_adherence_records (
            session_id,
            schedule_id,
            scheduled_date,
            time_slot,
            status
          )
          SELECT 
            v_session_id,
            p_schedule_id,
            d::date,
            t.time_slot,
            'pending'
          FROM generate_series(v_start_date, v_end_date, '1 day'::interval) d
          CROSS JOIN (
            SELECT time_slot 
            FROM schedule_time_slots 
            WHERE schedule_id = p_schedule_id
          ) t;

          RETURN v_session_id;
        END;
        $$ LANGUAGE plpgsql;

        -- Create view for session statistics
        CREATE OR REPLACE VIEW medication_session_stats AS
        SELECT 
          ms.id as session_id,
          ms.schedule_id,
          ms.start_date,
          ms.end_date,
          ms.active,
          pms.user_id,
          u.name as patient_name,
          m.brand_name,
          m.generic_name,
          mf.name as frequency_name,
          COUNT(mar.id) as total_doses,
          COUNT(CASE WHEN mar.status = 'taken' THEN 1 END) as doses_taken,
          COUNT(CASE WHEN mar.status = 'missed' THEN 1 END) as doses_missed,
          COUNT(CASE WHEN mar.status = 'late' THEN 1 END) as doses_late,
          ROUND(
            CAST(COUNT(CASE WHEN mar.status = 'taken' THEN 1 END) AS DECIMAL) / 
            NULLIF(COUNT(mar.id), 0) * 100,
            2
          ) as adherence_rate
        FROM medication_sessions ms
        JOIN patient_medication_schedules pms ON ms.schedule_id = pms.id
        JOIN users u ON pms.user_id = u.id
        JOIN medications m ON pms.medication_id = m.id
        JOIN medication_frequencies mf ON pms.frequency_code = mf.code
        LEFT JOIN medication_adherence_records mar ON ms.id = mar.session_id
        GROUP BY 
          ms.id,
          ms.schedule_id,
          ms.start_date,
          ms.end_date,
          ms.active,
          pms.user_id,
          u.name,
          m.brand_name,
          m.generic_name,
          mf.name;

        -- Grant permissions
        GRANT ALL ON medication_sessions TO authenticated;
        GRANT ALL ON medication_session_stats TO authenticated;
      `
    });

    if (error) throw error;
    console.log('Medication adherence system setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up medication adherence:', error);
    return false;
  }
}

setupMedicationAdherence()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
