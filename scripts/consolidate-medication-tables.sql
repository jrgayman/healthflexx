-- First, drop all existing medication-related tables and views
DROP VIEW IF EXISTS medication_session_summary CASCADE;
DROP VIEW IF EXISTS medication_adherence_summary CASCADE;
DROP VIEW IF EXISTS daily_medication_adherence CASCADE;
DROP TABLE IF EXISTS medication_tracking_records CASCADE;
DROP TABLE IF EXISTS medication_sessions CASCADE;
DROP TABLE IF EXISTS medication_adherence_records CASCADE;
DROP TABLE IF EXISTS medication_adherence_devices CASCADE;
DROP TABLE IF EXISTS patient_medication_schedules CASCADE;
DROP TABLE IF EXISTS schedule_time_slots CASCADE;
DROP TABLE IF EXISTS patient_medications CASCADE;

-- Create simplified patient_medications table
CREATE TABLE IF NOT EXISTS patient_medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  medication_id UUID NOT NULL REFERENCES medications(id),
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instructions TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication_sessions table for 30-day tracking periods
CREATE TABLE IF NOT EXISTS medication_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication_tracking_records table for individual dose tracking
CREATE TABLE IF NOT EXISTS medication_tracking_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES medication_sessions(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'missed', 'late')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_medications_user ON patient_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_medication ON patient_medications(medication_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_active ON patient_medications(active);

CREATE INDEX IF NOT EXISTS idx_med_sessions_patient ON medication_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_med_sessions_dates ON medication_sessions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_med_sessions_active ON medication_sessions(active);

CREATE INDEX IF NOT EXISTS idx_med_tracking_records_session ON medication_tracking_records(session_id);
CREATE INDEX IF NOT EXISTS idx_med_tracking_records_date ON medication_tracking_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_med_tracking_records_status ON medication_tracking_records(status);

-- Create view for session summary
CREATE OR REPLACE VIEW medication_session_summary AS
SELECT 
  ms.id as session_id,
  ms.patient_id,
  u.name as patient_name,
  ms.start_date,
  ms.end_date,
  ms.active,
  COUNT(mtr.id) as total_doses,
  COUNT(CASE WHEN mtr.status = 'taken' THEN 1 END) as doses_taken,
  COUNT(CASE WHEN mtr.status = 'missed' THEN 1 END) as doses_missed,
  COUNT(CASE WHEN mtr.status = 'late' THEN 1 END) as doses_late,
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
  ms.active;

-- Grant permissions
GRANT ALL ON patient_medications TO authenticated;
GRANT ALL ON medication_sessions TO authenticated;
GRANT ALL ON medication_tracking_records TO authenticated;
GRANT ALL ON medication_session_summary TO authenticated;