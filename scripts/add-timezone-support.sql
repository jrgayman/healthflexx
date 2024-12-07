-- Add timezone preference to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

-- Add timezone to medication sessions
ALTER TABLE medication_sessions
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Create function to get user's timezone
CREATE OR REPLACE FUNCTION get_user_timezone(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT timezone FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql;

-- Update session creation function to include timezone
CREATE OR REPLACE FUNCTION start_medication_session(p_patient_id UUID)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
  v_start_date DATE;
  v_end_date DATE;
  v_timezone TEXT;
BEGIN
  -- Get user's timezone
  SELECT timezone INTO v_timezone FROM users WHERE id = p_patient_id;
  
  -- Set session dates using user's timezone
  v_start_date := CURRENT_DATE AT TIME ZONE v_timezone;
  v_end_date := v_start_date + INTERVAL '29 days';

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
    v_start_date,
    v_end_date,
    v_timezone,
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
  FROM generate_series(v_start_date, v_end_date, '1 day'::interval) d
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