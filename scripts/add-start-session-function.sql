-- Function to start a new medication session
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION start_medication_session(UUID) TO authenticated;