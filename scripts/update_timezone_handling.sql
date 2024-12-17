-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS auto_mark_missed() CASCADE;
DROP FUNCTION IF EXISTS mark_missed_doses() CASCADE;

-- Create function to convert local time to UTC
CREATE OR REPLACE FUNCTION local_to_utc(
  p_date DATE,
  p_time TIME,
  p_timezone TEXT
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN (p_date || ' ' || p_time)::TIMESTAMP AT TIME ZONE p_timezone AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- Create function to mark missed doses with timezone awareness
CREATE OR REPLACE FUNCTION mark_missed_doses()
RETURNS void AS $$
BEGIN
  UPDATE medication_tracking_records mtr
  SET status = 'missed'
  FROM medication_sessions ms
  JOIN users u ON ms.patient_id = u.id
  WHERE mtr.session_id = ms.id
  AND mtr.status = 'pending'
  AND local_to_utc(mtr.scheduled_date, mtr.scheduled_time, u.timezone) < NOW()
  AND ms.active = true;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for auto-marking missed doses
CREATE OR REPLACE FUNCTION auto_mark_missed()
RETURNS trigger AS $$
DECLARE
  v_timezone TEXT;
BEGIN
  -- Get timezone from user
  SELECT u.timezone INTO v_timezone
  FROM medication_sessions ms
  JOIN users u ON ms.patient_id = u.id
  WHERE ms.id = NEW.session_id;

  IF NEW.status = 'pending' AND 
     local_to_utc(NEW.scheduled_date, NEW.scheduled_time, v_timezone) < NOW() THEN
    NEW.status := 'missed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-marking missed doses
DROP TRIGGER IF EXISTS trigger_auto_mark_missed ON medication_tracking_records;
CREATE TRIGGER trigger_auto_mark_missed
  BEFORE INSERT OR UPDATE ON medication_tracking_records
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_missed();

-- Run initial update to mark missed doses
SELECT mark_missed_doses();