-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create medication frequencies table
CREATE TABLE IF NOT EXISTS medication_frequencies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  times_per_day INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_med_frequencies_code ON medication_frequencies(code);

-- Insert standard frequencies
INSERT INTO medication_frequencies (code, name, description, times_per_day) 
VALUES 
  ('qd', 'Once daily', 'Take once per day', 1),
  ('bid', 'Twice daily', 'Take twice per day', 2),
  ('tid', 'Three times daily', 'Take three times per day', 3),
  ('qid', 'Four times daily', 'Takeza four times per day', 4)
ON CONFLICT (code) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  times_per_day = EXCLUDED.times_per_day;

-- Update medication schedules table to reference frequencies
ALTER TABLE medication_schedules
DROP CONSTRAINT IF EXISTS medication_schedules_frequency_check,
ADD CONSTRAINT medication_schedules_frequency_fkey 
  FOREIGN KEY (frequency) 
  REFERENCES medication_frequencies(code)
  ON UPDATE CASCADE;

-- Create view for schedule frequencies
CREATE OR REPLACE VIEW schedule_frequencies AS
SELECT 
  ms.id as schedule_id,
  ms.user_id,
  u.name as patient_name,
  m.brand_name,
  m.generic_name,
  mf.code as frequency_code,
  mf.name as frequency_name,
  mf.description as frequency_description,
  mf.times_per_day,
  ms.start_date,
  ms.end_date,
  ms.active
FROM medication_schedules ms
JOIN users u ON ms.user_id = u.id
JOIN medications m ON ms.medication_id = m.id
JOIN medication_frequencies mf ON ms.frequency = mf.code;

-- Grant permissions
GRANT ALL ON medication_frequencies TO authenticated;
GRANT ALL ON schedule_frequencies TO authenticated;