```sql
-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing views and tables to start fresh
DROP VIEW IF EXISTS medication_session_summary CASCADE;
DROP TABLE IF EXISTS medication_tracking_records CASCADE;
DROP TABLE IF EXISTS medication_sessions CASCADE;

-- Create medication sessions table
CREATE TABLE medication_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  first_use_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication tracking records table
CREATE TABLE medication_tracking_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES medication_sessions(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'missed', 'overtaken')),
  dose_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_med_sessions_patient ON medication_sessions(patient_id);
CREATE INDEX idx_med_sessions_dates ON medication_sessions(start_date, end_date);
CREATE INDEX idx_med_sessions_active ON medication_sessions(active);
CREATE INDEX idx_med_tracking_session ON medication_tracking_records(session_id);
CREATE INDEX idx_med_tracking_date ON medication_tracking_records(scheduled_date);
CREATE INDEX idx_med_tracking_status ON medication_tracking_records(status);
CREATE INDEX idx_med_tracking_dose_count ON medication_tracking_records(dose_count);

-- Create view for session summary
CREATE VIEW medication_session_summary AS
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
  COUNT(CASE WHEN mtr.status = 'overtaken' THEN 1 END) as doses_overtaken,
  SUM(mtr.dose_count) as total_dose_count,
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
  IF NEW.status IN ('taken', 'overtaken') AND OLD.status = 'pending' THEN
    UPDATE medication_sessions
    SET first_use_date = NEW.scheduled_date
    WHERE id = NEW.session_id
    AND first_use_date IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle multiple doses
CREATE OR REPLACE FUNCTION handle_multiple_doses()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'taken' AND OLD.status IN ('taken', 'overtaken') THEN
    NEW.status := 'overtaken';
    NEW.dose_count := OLD.dose_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_first_use_date ON medication_tracking_records;
CREATE TRIGGER trigger_update_first_use_date
BEFORE UPDATE OF status ON medication_tracking_records
FOR EACH ROW
EXECUTE FUNCTION update_first_use_date();

DROP TRIGGER IF EXISTS trigger_handle_multiple_doses ON medication_tracking_records;
CREATE TRIGGER trigger_handle_multiple_doses
BEFORE UPDATE OF status ON medication_tracking_records
FOR EACH ROW
EXECUTE FUNCTION handle_multiple_doses();

-- Grant permissions
GRANT ALL ON medication_sessions TO authenticated;
GRANT ALL ON medication_tracking_records TO authenticated;
GRANT SELECT ON medication_session_summary TO authenticated;
GRANT EXECUTE ON FUNCTION update_first_use_date() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_multiple_doses() TO authenticated;
```