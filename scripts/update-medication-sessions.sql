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
  status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'missed', 'late', 'overtaken')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_med_sessions_patient ON medication_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_med_sessions_dates ON medication_sessions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_med_sessions_active ON medication_sessions(active);

CREATE INDEX IF NOT EXISTS idx_med_tracking_session ON medication_tracking_records(session_id);
CREATE INDEX IF NOT EXISTS idx_med_tracking_date ON medication_tracking_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_med_tracking_status ON medication_tracking_records(status);

-- Create function to start new medication session
CREATE OR REPLACE FUNCTION start_medication_session(
  p_patient_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_end_date DATE;
BEGIN
  -- Calculate end date (29 days after start to make it inclusive for 30 total days)
  v_end_date := p_start_date + INTERVAL '29 days';

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
    p_start_date,
    v_end_date,
    true
  ) RETURNING id INTO v_session_id;

  -- Generate tracking records for standard times
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
  FROM generate_series(p_start_date, v_end_date, '1 day'::interval) d
  CROSS JOIN (
    VALUES 
      ('08:00:00'::TIME),
      ('12:00:00'::TIME),
      ('16:00:00'::TIME),
      ('20:00:00'::TIME)
  ) times(t);

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON medication_sessions TO authenticated;
GRANT ALL ON medication_tracking_records TO authenticated;
GRANT EXECUTE ON FUNCTION start_medication_session(UUID, DATE) TO authenticated;