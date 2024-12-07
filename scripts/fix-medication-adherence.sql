-- Create function to start new medication session
CREATE OR REPLACE FUNCTION start_medication_session(p_patient_id UUID)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_start_date DATE;
  v_end_date DATE;
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

  -- Generate tracking records for standard times (8am, 12pm, 6pm)
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
  CROSS JOIN (
    VALUES 
      ('08:00:00'::TIME),
      ('12:00:00'::TIME),
      ('18:00:00'::TIME)
  ) times(t);

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION start_medication_session(UUID) TO authenticated;