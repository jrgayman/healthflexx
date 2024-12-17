-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS start_medication_session(uuid, date) CASCADE;
DROP FUNCTION IF EXISTS start_medication_session(uuid, date, text, text[]) CASCADE;

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

-- Create timezone-aware session function
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

-- Create function to handle timezone conversions
CREATE OR REPLACE FUNCTION is_time_expired(
  p_date DATE,
  p_time TIME,
  p_timezone TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (p_date || ' ' || p_time)::TIMESTAMP AT TIME ZONE p_timezone < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to mark missed doses
CREATE OR REPLACE FUNCTION mark_missed_doses()
RETURNS void AS $$
BEGIN
  UPDATE medication_tracking_records mtr
  SET status = 'missed'
  FROM medication_sessions ms
  WHERE mtr.session_id = ms.id
  AND mtr.status = 'pending'
  AND is_time_expired(mtr.scheduled_date, mtr.scheduled_time, ms.timezone)
  AND ms.active = true;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-marking missed doses
CREATE OR REPLACE FUNCTION auto_mark_missed()
RETURNS trigger AS $$
DECLARE
  v_timezone TEXT;
BEGIN
  SELECT timezone INTO v_timezone
  FROM medication_sessions
  WHERE id = NEW.session_id;

  IF NEW.status = 'pending' AND 
     is_time_expired(NEW.scheduled_date, NEW.scheduled_time, v_timezone) THEN
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