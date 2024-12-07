-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update medication sessions table
ALTER TABLE medication_sessions
ADD COLUMN IF NOT EXISTS first_use_date DATE;

-- Create or replace view for session summary with first use tracking
CREATE OR REPLACE VIEW medication_session_summary AS
SELECT 
  ms.id as session_id,
  ms.patient_id,
  ms.start_date,
  ms.end_date,
  ms.active,
  ms.created_at,
  ms.first_use_date,
  u.name as patient_name,
  COUNT(mtr.id) as total_doses,
  COUNT(CASE WHEN mtr.status = 'taken' THEN 1 END) as doses_taken,
  COUNT(CASE WHEN mtr.status = 'missed' THEN 1 END) as doses_missed,
  COUNT(CASE WHEN mtr.status = 'late' THEN 1 END) as doses_late,
  COUNT(CASE WHEN mtr.status = 'overtaken' THEN 1 END) as doses_overtaken,
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
  ms.start_date,
  ms.end_date,
  ms.active,
  ms.created_at,
  ms.first_use_date,
  u.name;

-- Create function to update first use date
CREATE OR REPLACE FUNCTION update_first_use_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('taken', 'late') AND OLD.status = 'pending' THEN
    UPDATE medication_sessions
    SET first_use_date = NEW.scheduled_date
    WHERE id = NEW.session_id
    AND first_use_date IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for first use tracking
DROP TRIGGER IF EXISTS trigger_update_first_use_date ON medication_tracking_records;
CREATE TRIGGER trigger_update_first_use_date
AFTER UPDATE OF status ON medication_tracking_records
FOR EACH ROW
EXECUTE FUNCTION update_first_use_date();

-- Update start_medication_session function to use provided start date
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
    active,
    first_use_date
  ) VALUES (
    p_patient_id,
    p_start_date,
    v_end_date,
    true,
    NULL
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
GRANT EXECUTE ON FUNCTION update_first_use_date() TO authenticated;