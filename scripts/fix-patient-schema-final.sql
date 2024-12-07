-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing views and triggers that might conflict
DROP VIEW IF EXISTS patient_details CASCADE;
DROP VIEW IF EXISTS room_occupancy_details CASCADE;
DROP TRIGGER IF EXISTS trigger_create_patient_record ON users CASCADE;

-- Create sequence for medical record numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS patients_mrn_seq START 1;

-- Create function to generate MRN
CREATE OR REPLACE FUNCTION generate_mrn()
RETURNS TEXT AS $$
BEGIN
  RETURN 'MRN' || LPAD(NEXTVAL('patients_mrn_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medical_record_number TEXT UNIQUE,
  date_of_birth DATE,
  gender TEXT,
  primary_physician TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  insurance_provider TEXT,
  insurance_id TEXT,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_medical_record_number ON patients(medical_record_number);
CREATE INDEX IF NOT EXISTS idx_patients_room_id ON patients(room_id);
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(active);

-- Create patient details view
CREATE OR REPLACE VIEW patient_details AS
SELECT 
  p.id,
  p.medical_record_number,
  p.date_of_birth,
  p.gender,
  p.primary_physician,
  p.emergency_contact,
  p.emergency_phone,
  p.insurance_provider,
  p.insurance_id,
  p.active,
  p.room_id,
  u.id as user_id,
  u.name as patient_name,
  u.email,
  u.phone,
  u.access_level,
  b.name as building_name,
  r.room_number,
  r.floor
FROM patients p
JOIN users u ON p.user_id = u.id
LEFT JOIN rooms r ON p.room_id = r.id
LEFT JOIN buildings b ON r.building_id = b.id;

-- Create room occupancy details view
CREATE OR REPLACE VIEW room_occupancy_details AS
SELECT 
  r.id as room_id,
  r.room_number,
  r.name as room_name,
  r.floor,
  r.capacity,
  r.current_occupancy,
  b.name as building_name,
  COUNT(p.id) as actual_occupancy,
  ARRAY_AGG(
    CASE 
      WHEN p.id IS NOT NULL 
      THEN jsonb_build_object(
        'id', p.id,
        'user_id', u.id,
        'name', u.name,
        'medical_record_number', p.medical_record_number
      )
      ELSE NULL 
    END
  ) FILTER (WHERE p.id IS NOT NULL) as patients
FROM rooms r
LEFT JOIN buildings b ON r.building_id = b.id
LEFT JOIN patients p ON r.id = p.room_id AND p.active = true
LEFT JOIN users u ON p.user_id = u.id
GROUP BY r.id, r.room_number, r.name, r.floor, r.capacity, r.current_occupancy, b.name;

-- Create function to automatically create patient record
CREATE OR REPLACE FUNCTION create_patient_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create patient record if one doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM patients WHERE user_id = NEW.id) THEN
    INSERT INTO patients (
      user_id,
      medical_record_number
    ) VALUES (
      NEW.id,
      generate_mrn()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create patient record for new users
CREATE TRIGGER trigger_create_patient_record
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_patient_record();

-- Create patient records for existing users that don't have one
INSERT INTO patients (user_id, medical_record_number)
SELECT 
  u.id,
  generate_mrn()
FROM users u
WHERE NOT EXISTS (
  SELECT 1 
  FROM patients p 
  WHERE p.user_id = u.id
);