-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table first
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
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_medical_record_number ON patients(medical_record_number);
CREATE INDEX IF NOT EXISTS idx_patients_room_id ON patients(room_id);
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(active);

-- Create sequence for medical record numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS patients_mrn_seq START 1;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_patient_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_patient_timestamp ON patients;
CREATE TRIGGER trigger_update_patient_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_patient_timestamp();

-- Now create the views
DROP VIEW IF EXISTS patient_details CASCADE;
DROP VIEW IF EXISTS room_occupancy_details CASCADE;

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
  IF NEW.user_type = 'Patient' THEN
    INSERT INTO patients (
      user_id,
      medical_record_number,
      date_of_birth,
      gender,
      primary_physician,
      emergency_contact,
      emergency_phone,
      insurance_provider,
      insurance_id
    ) VALUES (
      NEW.id,
      'MRN' || LPAD(NEXTVAL('patients_mrn_seq')::TEXT, 6, '0'),
      NEW.date_of_birth,
      NEW.gender,
      NEW.primary_physician,
      NEW.emergency_contact,
      NEW.emergency_phone,
      NEW.insurance_provider,
      NEW.insurance_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create patient record
DROP TRIGGER IF EXISTS trigger_create_patient_record ON users;
CREATE TRIGGER trigger_create_patient_record
AFTER INSERT ON users
FOR EACH ROW
WHEN (NEW.user_type = 'Patient')
EXECUTE FUNCTION create_patient_record();

-- Fix any inconsistencies in current occupancy counts
UPDATE rooms r
SET current_occupancy = (
  SELECT COUNT(*)
  FROM patients p
  WHERE p.room_id = r.id
  AND p.active = true
);