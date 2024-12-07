-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create medication frequencies table if it doesn't exist
CREATE TABLE IF NOT EXISTS medication_frequencies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  times_per_day INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard frequencies
INSERT INTO medication_frequencies (code, name, description, times_per_day) 
VALUES 
  ('qd', 'Once daily', 'Take once per day', 1),
  ('bid', 'Twice daily', 'Take twice per day', 2),
  ('tid', 'Three times daily', 'Take three times per day', 3),
  ('qid', 'Four times daily', 'Take four times per day', 4)
ON CONFLICT (code) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  times_per_day = EXCLUDED.times_per_day;

-- Create patient medication schedules table
CREATE TABLE IF NOT EXISTS patient_medication_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  medication_id UUID NOT NULL REFERENCES medications(id),
  frequency_code TEXT NOT NULL REFERENCES medication_frequencies(code),
  start_date DATE NOT NULL,
  end_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create schedule time slots table
CREATE TABLE IF NOT EXISTS schedule_time_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES patient_medication_schedules(id) ON DELETE CASCADE,
  time_slot TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication adherence records table
CREATE TABLE IF NOT EXISTS medication_adherence_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES patient_medication_schedules(id),
  scheduled_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  taken_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'taken', 'missed', 'late', 'overtaken')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patient_med_schedules_user ON patient_medication_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_med_schedules_medication ON patient_medication_schedules(medication_id);
CREATE INDEX IF NOT EXISTS idx_patient_med_schedules_active ON patient_medication_schedules(active);

CREATE INDEX IF NOT EXISTS idx_schedule_time_slots_schedule ON schedule_time_slots(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_time_slots_time ON schedule_time_slots(time_slot);

CREATE INDEX IF NOT EXISTS idx_med_adherence_schedule ON medication_adherence_records(schedule_id);
CREATE INDEX IF NOT EXISTS idx_med_adherence_date ON medication_adherence_records(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_med_adherence_status ON medication_adherence_records(status);

-- Create view for patient medication schedules
CREATE OR REPLACE VIEW patient_medication_schedule_details AS
SELECT 
  pms.id as schedule_id,
  pms.user_id,
  u.name as patient_name,
  u.medical_record_number,
  m.id as medication_id,
  m.brand_name,
  m.generic_name,
  mf.code as frequency_code,
  mf.name as frequency_name,
  mf.description as frequency_description,
  mf.times_per_day,
  pms.start_date,
  pms.end_date,
  pms.active,
  ARRAY_AGG(DISTINCT sts.time_slot ORDER BY sts.time_slot) as time_slots,
  COUNT(DISTINCT mar.id) as total_doses,
  COUNT(CASE WHEN mar.status = 'taken' THEN 1 END) as doses_taken,
  COUNT(CASE WHEN mar.status = 'missed' THEN 1 END) as doses_missed,
  COUNT(CASE WHEN mar.status = 'late' THEN 1 END) as doses_late,
  ROUND(
    CAST(COUNT(CASE WHEN mar.status = 'taken' THEN 1 END) AS DECIMAL) / 
    NULLIF(COUNT(DISTINCT mar.id), 0) * 100,
    2
  ) as adherence_rate
FROM patient_medication_schedules pms
JOIN users u ON pms.user_id = u.id
JOIN medications m ON pms.medication_id = m.id
JOIN medication_frequencies mf ON pms.frequency_code = mf.code
LEFT JOIN schedule_time_slots sts ON pms.id = sts.schedule_id
LEFT JOIN medication_adherence_records mar ON pms.id = mar.schedule_id
GROUP BY 
  pms.id,
  pms.user_id,
  u.name,
  u.medical_record_number,
  m.id,
  m.brand_name,
  m.generic_name,
  mf.code,
  mf.name,
  mf.description,
  mf.times_per_day,
  pms.start_date,
  pms.end_date,
  pms.active;

-- Create view for daily adherence summary
CREATE OR REPLACE VIEW daily_medication_adherence AS
SELECT 
  mar.schedule_id,
  pms.user_id,
  u.name as patient_name,
  u.medical_record_number,
  m.brand_name,
  m.generic_name,
  mar.scheduled_date as date,
  COUNT(mar.id) as total_doses,
  COUNT(CASE WHEN mar.status = 'taken' THEN 1 END) as doses_taken,
  COUNT(CASE WHEN mar.status = 'missed' THEN 1 END) as doses_missed,
  COUNT(CASE WHEN mar.status = 'late' THEN 1 END) as doses_late,
  ROUND(
    CAST(COUNT(CASE WHEN mar.status = 'taken' THEN 1 END) AS DECIMAL) / 
    NULLIF(COUNT(mar.id), 0) * 100,
    2
  ) as adherence_rate
FROM medication_adherence_records mar
JOIN patient_medication_schedules pms ON mar.schedule_id = pms.id
JOIN users u ON pms.user_id = u.id
JOIN medications m ON pms.medication_id = m.id
GROUP BY 
  mar.schedule_id,
  pms.user_id,
  u.name,
  u.medical_record_number,
  m.brand_name,
  m.generic_name,
  mar.scheduled_date;

-- Grant permissions
GRANT ALL ON medication_frequencies TO authenticated;
GRANT ALL ON patient_medication_schedules TO authenticated;
GRANT ALL ON schedule_time_slots TO authenticated;
GRANT ALL ON medication_adherence_records TO authenticated;
GRANT ALL ON patient_medication_schedule_details TO authenticated;
GRANT ALL ON daily_medication_adherence TO authenticated;