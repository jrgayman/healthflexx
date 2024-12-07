-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create reading types table
DROP TABLE IF EXISTS medical_readings CASCADE;
DROP TABLE IF EXISTS reading_types CASCADE;

CREATE TABLE reading_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  unit TEXT,
  value_type TEXT NOT NULL CHECK (value_type IN ('numeric', 'text', 'image', 'audio', 'pdf', 'media', 'blood_pressure')),
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reading_types_code ON reading_types(code);

-- Insert reading types
INSERT INTO reading_types (
  name, code, unit, value_type, description, icon
) VALUES 
  ('Blood Pressure', 'BP', 'mmHg', 'blood_pressure', 'Blood pressure reading (systolic/diastolic)', '🫀'),
  ('Heart Rate', 'HR', 'bpm', 'numeric', 'Heart rate in beats per minute', '💓'),
  ('Temperature', 'TEMP', '°F', 'numeric', 'Body temperature in Fahrenheit', '🌡️'),
  ('Blood Oxygen', 'SPO2', '%', 'numeric', 'Blood oxygen saturation level', '💨'),
  ('Weight', 'WT', 'lb', 'numeric', 'Body weight in pounds', '⚖️'),
  ('Blood Glucose', 'BG', 'mg/dL', 'numeric', 'Blood glucose level', '🩸'),
  ('Otoscope', 'OTO', NULL, 'image', 'Otoscope examination images', '👂'),
  ('Stethoscope', 'STETH', NULL, 'audio', 'Stethoscope audio recordings', '🔊'),
  ('EKG', 'EKG', NULL, 'pdf', 'Electrocardiogram readings', '💗'),
  ('Pic/Video', 'MEDIA', NULL, 'media', 'Medical pictures or videos', '📸'),
  ('Notes', 'NOTE', NULL, 'text', 'Clinical notes and observations', '📝');

-- Create medical readings table
CREATE TABLE medical_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reading_type_id UUID NOT NULL REFERENCES reading_types(id),
  reading_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  numeric_value DECIMAL,
  systolic_value DECIMAL,
  diastolic_value DECIMAL,
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
    WHEN 'blood_pressure' THEN
      IF NEW.systolic_value IS NULL OR NEW.diastolic_value IS NULL THEN
        RAISE EXCEPTION 'Blood pressure readings must have both systolic and diastolic values';
      END IF;
    WHEN 'text' THEN
      IF NEW.text_value IS NULL THEN
        RAISE EXCEPTION 'Text readings must have text_value set';
      END IF;
    WHEN 'image', 'audio', 'pdf', 'media' THEN
      IF NEW.file_path IS NULL THEN
        RAISE EXCEPTION 'File-based readings must have file_path set';
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

-- Create view for easier querying of readings
CREATE OR REPLACE VIEW patient_readings AS
SELECT 
  mr.*,
  rt.name as reading_name,
  rt.code as reading_code,
  rt.unit as reading_unit,
  rt.value_type,
  rt.icon as reading_icon,
  u.name as patient_name,
  u.medical_record_number,
  cb.name as created_by_name
FROM medical_readings mr
JOIN reading_types rt ON mr.reading_type_id = rt.id
JOIN users u ON mr.user_id = u.id
LEFT JOIN users cb ON mr.created_by = cb.id
ORDER BY mr.reading_date DESC;