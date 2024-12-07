-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create reading types table
DROP TABLE IF EXISTS medical_readings CASCADE;
DROP TABLE IF EXISTS reading_types CASCADE;

CREATE TABLE reading_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  unit TEXT,
  value_type TEXT NOT NULL CHECK (value_type IN ('numeric', 'text', 'image', 'audio', 'pdf', 'media')),
  normal_min DECIMAL,
  normal_max DECIMAL,
  critical_low DECIMAL,
  critical_high DECIMAL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reading_types_code ON reading_types(code);

-- Insert reading types with ranges
INSERT INTO reading_types (
  name, code, unit, value_type, 
  normal_min, normal_max, 
  critical_low, critical_high,
  description, icon
) VALUES 
  ('Blood Pressure Systolic', 'BPS', 'mmHg', 'numeric', 90, 120, 70, 180, 'Systolic blood pressure reading', '🫀'),
  ('Blood Pressure Diastolic', 'BPD', 'mmHg', 'numeric', 60, 80, 40, 120, 'Diastolic blood pressure reading', '🫀'),
  ('Heart Rate', 'HR', 'bpm', 'numeric', 60, 100, 40, 150, 'Heart rate in beats per minute', '💓'),
  ('Temperature', 'TEMP', '°F', 'numeric', 97.0, 99.0, 95.0, 103.0, 'Body temperature in Fahrenheit', '🌡️'),
  ('Blood Oxygen', 'SPO2', '%', 'numeric', 95, 100, 90, NULL, 'Blood oxygen saturation level', '💨'),
  ('Weight', 'WT', 'lb', 'numeric', NULL, NULL, NULL, NULL, 'Body weight in pounds', '⚖️'),
  ('Blood Glucose', 'BG', 'mg/dL', 'numeric', 70, 140, 50, 300, 'Blood glucose level', '🩸'),
  ('Otoscope', 'OTO', NULL, 'image', NULL, NULL, NULL, NULL, 'Otoscope examination images', '👂'),
  ('Stethoscope', 'STETH', NULL, 'audio', NULL, NULL, NULL, NULL, 'Stethoscope audio recordings', '🔊'),
  ('EKG', 'EKG', NULL, 'pdf', NULL, NULL, NULL, NULL, 'Electrocardiogram readings', '💗'),
  ('Pic/Video', 'MEDIA', NULL, 'media', NULL, NULL, NULL, NULL, 'Medical pictures or videos', '📸'),
  ('Notes', 'NOTE', NULL, 'text', NULL, NULL, NULL, NULL, 'Clinical notes and observations', '📝');

-- Create medical readings table
CREATE TABLE medical_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_type_id UUID NOT NULL REFERENCES reading_types(id),
  reading_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  numeric_value DECIMAL,
  text_value TEXT,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  file_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_medical_readings_user ON medical_readings(user_id);
CREATE INDEX idx_medical_readings_type ON medical_readings(reading_type_id);
CREATE INDEX idx_medical_readings_date ON medical_readings(reading_date);
CREATE INDEX idx_medical_readings_created_by ON medical_readings(created_by);

-- Create function to validate reading values
CREATE OR REPLACE FUNCTION validate_reading_values()
RETURNS TRIGGER AS $$
DECLARE
  v_value_type TEXT;
BEGIN
  -- Get the value type for this reading
  SELECT value_type INTO v_value_type
  FROM reading_types
  WHERE id = NEW.reading_type_id;

  -- Validate based on value type
  CASE v_value_type
    WHEN 'numeric' THEN
      IF NEW.numeric_value IS NULL OR NEW.text_value IS NOT NULL OR NEW.file_path IS NOT NULL THEN
        RAISE EXCEPTION 'Numeric readings must have only numeric_value set';
      END IF;
    WHEN 'text' THEN
      IF NEW.text_value IS NULL OR NEW.numeric_value IS NOT NULL OR NEW.file_path IS NOT NULL THEN
        RAISE EXCEPTION 'Text readings must have only text_value set';
      END IF;
    WHEN 'image', 'audio', 'pdf', 'media' THEN
      IF NEW.file_path IS NULL OR NEW.numeric_value IS NOT NULL OR NEW.text_value IS NOT NULL THEN
        RAISE EXCEPTION 'File-based readings must have only file_path set';
      END IF;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for value validation
CREATE TRIGGER validate_reading_values
BEFORE INSERT OR UPDATE ON medical_readings
FOR EACH ROW
EXECUTE FUNCTION validate_reading_values();

-- Create view for easier querying of readings with type information
CREATE OR REPLACE VIEW patient_readings AS
WITH latest_readings AS (
  SELECT DISTINCT ON (user_id, reading_type_id)
    mr.*,
    rt.name as reading_name,
    rt.code as reading_code,
    rt.unit as reading_unit,
    rt.value_type,
    rt.normal_min,
    rt.normal_max,
    rt.critical_low,
    rt.critical_high,
    rt.icon as reading_icon,
    u.name as patient_name,
    u.medical_record_number,
    cb.name as created_by_name,
    ROW_NUMBER() OVER (
      PARTITION BY mr.user_id, rt.code 
      ORDER BY mr.reading_date DESC
    ) as reading_rank
  FROM medical_readings mr
  JOIN reading_types rt ON mr.reading_type_id = rt.id
  JOIN users u ON mr.user_id = u.id
  LEFT JOIN users cb ON mr.created_by = cb.id
)
SELECT * FROM latest_readings
WHERE reading_rank = 1
ORDER BY reading_date DESC
LIMIT 50;

-- Create view for blood pressure readings specifically
CREATE OR REPLACE VIEW blood_pressure_readings AS
SELECT 
  mr.user_id,
  mr.reading_date,
  MAX(CASE WHEN rt.code = 'BPS' THEN mr.numeric_value END) as systolic,
  MAX(CASE WHEN rt.code = 'BPD' THEN mr.numeric_value END) as diastolic,
  MAX(mr.created_at) as reading_created_at,
  MAX(mr.created_by) as reading_created_by
FROM medical_readings mr
JOIN reading_types rt ON mr.reading_type_id = rt.id
WHERE rt.code IN ('BPS', 'BPD')
GROUP BY mr.user_id, mr.reading_date
ORDER BY mr.reading_date DESC
LIMIT 50;