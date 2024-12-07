-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create medication sessions table
CREATE TABLE IF NOT EXISTS medication_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication tracking records table
CREATE TABLE IF NOT EXISTS medication_tracking_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES medication_sessions(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'missed', 'late')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_med_sessions_patient ON medication_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_med_sessions_dates ON medication_sessions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_med_sessions_active ON medication_sessions(active);

CREATE INDEX IF NOT EXISTS idx_med_tracking_records_session ON medication_tracking_records(session_id);
CREATE INDEX IF NOT EXISTS idx_med_tracking_records_date ON medication_tracking_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_med_tracking_records_status ON medication_tracking_records(status);

-- Function to start a new tracking session
CREATE OR REPLACE FUNCTION start_medication_session(p_patient_id UUID)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_start_date DATE;
  v_end_date DATE;
  v_time_slots TIME[];
BEGIN
  -- Set session dates
  v_start_date := CURRENT_DATE;
  v_end_date := v_start_date + INTERVAL '30 days';

  -- Set previous session as inactive
  UPDATE medication_sessions
  SET active = false
  WHERE patient_id = p_patient_id AND active = true;

  -- Create new session
  INSERT INTO medication_sessions (
    patient_id,
    start_date,
    end_date,
    active
  ) VALUES (
    p_patient_id,
    v_start_date,
    v_end_date,
    true
  ) RETURNING id INTO v_session_id;

  -- Get patient's medication schedule times
  SELECT ARRAY_AGG(DISTINCT time_slot ORDER BY time_slot)
  INTO v_time_slots
  FROM patient_medication_schedules pms
  JOIN schedule_time_slots sts ON pms.id = sts.schedule_id
  WHERE pms.user_id = p_patient_id
  AND pms.active = true;

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
    t,
    'pending'
  FROM generate_series(v_start_date, v_end_date, '1 day'::interval) d
  CROSS JOIN unnest(v_time_slots) t;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for session summary
CREATE OR REPLACE VIEW medication_session_summary AS
SELECT 
  ms.id as session_id,
  ms.patient_id,
  u.name as patient_name,
  ms.start_date,
  ms.end_date,
  ms.active,
  COUNT(mtr.id) as total_doses,
  COUNT(CASE WHEN mtr.status = 'taken' THEN 1 END) as doses_taken,
  COUNT(CASE WHEN mtr.status = 'missed' THEN 1 END) as doses_missed,
  COUNT(CASE WHEN mtr.status = 'late' THEN 1 END) as doses_late,
  ROUND(
    CAST(COUNT(CASE WHEN mtr.status = 'taken' THEN 1 END) AS NUMERIC) / 
    NULLIF(COUNT(mtr.id), 0) * 100,
    2
  ) as adherence_rate
FROM medication_sessions ms
JOIN users u ON ms.patient_id = u.id
LEFT JOIN medication_tracking_records mtr ON ms.id = mtr.session_id
GROUP BY 
  ms.id,
  ms.patient_id,
  u.name,
  ms.start_date,
  ms.end_date,
  ms.active;

-- Grant permissions
GRANT ALL ON medication_sessions TO authenticated;
GRANT ALL ON medication_tracking_records TO authenticated;
GRANT ALL ON medication_session_summary TO authenticated;
GRANT EXECUTE ON FUNCTION start_medication_session(UUID) TO authenticated;