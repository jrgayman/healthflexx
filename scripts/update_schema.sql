-- Drop existing functions and views
DROP FUNCTION IF EXISTS start_medication_session(uuid, date) CASCADE;
DROP FUNCTION IF EXISTS start_medication_session(uuid, date, text, text[]) CASCADE;
DROP VIEW IF EXISTS medication_tracking_details CASCADE;

-- Add timezone and medication_times columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS medication_times JSONB DEFAULT '[
  {"id": "morning", "label": "Morning", "time": "08:00", "enabled": true},
  {"id": "noon", "label": "Noon", "time": "12:00", "enabled": true},
  {"id": "afternoon", "label": "Afternoon", "time": "16:00", "enabled": true},
  {"id": "evening", "label": "Evening", "time": "20:00", "enabled": true}
]'::jsonb;

-- Add timezone to medication_sessions
ALTER TABLE medication_sessions
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Update medication_tracking_records to use time without time zone
ALTER TABLE medication_tracking_records
ALTER COLUMN scheduled_time TYPE time without time zone 
USING scheduled_time::time without time zone;

-- Create new start_medication_session function
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

  -- Generate tracking records
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

-- Create trigger for auto-marking missed doses
CREATE OR REPLACE FUNCTION auto_mark_missed()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'pending' AND 
     (NEW.scheduled_date || ' ' || NEW.scheduled_time)::timestamp < NOW() THEN
    NEW.status := 'missed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_mark_missed ON medication_tracking_records;
CREATE TRIGGER trigger_auto_mark_missed
  BEFORE INSERT OR UPDATE ON medication_tracking_records
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_missed();

-- Run initial update to mark missed doses
SELECT mark_missed_doses();