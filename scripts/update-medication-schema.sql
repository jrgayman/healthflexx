-- Drop existing views first
DROP VIEW IF EXISTS medication_session_summary CASCADE;

-- Add MAC address columns to medication_sessions if they don't exist
ALTER TABLE medication_sessions
ADD COLUMN IF NOT EXISTS morning_mac TEXT,
ADD COLUMN IF NOT EXISTS noon_mac TEXT,
ADD COLUMN IF NOT EXISTS afternoon_mac TEXT,
ADD COLUMN IF NOT EXISTS evening_mac TEXT;

-- Recreate the session summary view with MAC addresses
CREATE OR REPLACE VIEW medication_session_summary AS
SELECT 
  ms.id as session_id,
  ms.patient_id,
  u.name as patient_name,
  ms.start_date,
  ms.end_date,
  ms.morning_mac,
  ms.noon_mac,
  ms.afternoon_mac,
  ms.evening_mac,
  ms.active,
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
  u.name,
  ms.start_date,
  ms.end_date,
  ms.morning_mac,
  ms.noon_mac,
  ms.afternoon_mac,
  ms.evening_mac,
  ms.active;

-- Update the status check constraint to include 'overtaken'
ALTER TABLE medication_tracking_records 
DROP CONSTRAINT IF EXISTS medication_tracking_records_status_check;

ALTER TABLE medication_tracking_records
ADD CONSTRAINT medication_tracking_records_status_check 
CHECK (status IN ('pending', 'taken', 'missed', 'late', 'overtaken'));

-- Update the start_medication_session function
CREATE OR REPLACE FUNCTION start_medication_session(
  p_patient_id UUID,
  p_morning_mac TEXT DEFAULT NULL,
  p_noon_mac TEXT DEFAULT NULL,
  p_afternoon_mac TEXT DEFAULT NULL,
  p_evening_mac TEXT DEFAULT NULL
)
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
    morning_mac,
    noon_mac,
    afternoon_mac,
    evening_mac,
    active
  ) VALUES (
    p_patient_id,
    v_start_date,
    v_end_date,
    p_morning_mac,
    p_noon_mac,
    p_afternoon_mac,
    p_evening_mac,
    true
  ) RETURNING id INTO v_session_id;

  -- Generate tracking records for each time slot
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

-- Grant permissions
GRANT ALL ON medication_sessions TO authenticated;
GRANT ALL ON medication_tracking_records TO authenticated;
GRANT ALL ON medication_session_summary TO authenticated;
GRANT EXECUTE ON FUNCTION start_medication_session(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;