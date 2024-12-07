-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS start_medication_session(UUID);
DROP FUNCTION IF EXISTS start_medication_session(UUID, DATE);
DROP FUNCTION IF EXISTS start_medication_session(UUID, TEXT, TEXT, TEXT, TEXT);

-- Create single consolidated function
CREATE OR REPLACE FUNCTION start_medication_session(
  p_patient_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_timezone TEXT DEFAULT 'America/New_York'
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
    timezone,
    active
  ) VALUES (
    p_patient_id,
    p_start_date,
    v_end_date,
    p_timezone,
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION start_medication_session(UUID, DATE, TEXT) TO authenticated;