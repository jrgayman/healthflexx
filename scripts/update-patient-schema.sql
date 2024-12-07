-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patients table
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

-- Create function to check room capacity
CREATE OR REPLACE FUNCTION check_room_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check capacity when assigning a room
  IF NEW.room_id IS NOT NULL THEN
    -- Get current occupancy and capacity
    DECLARE
      room_capacity INTEGER;
      room_occupancy INTEGER;
    BEGIN
      SELECT capacity, current_occupancy 
      INTO room_capacity, room_occupancy
      FROM rooms 
      WHERE id = NEW.room_id;

      -- For new assignments
      IF OLD.room_id IS NULL OR OLD.room_id != NEW.room_id THEN
        IF room_occupancy >= room_capacity THEN
          RAISE EXCEPTION 'Room capacity exceeded';
        END IF;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for capacity check
DROP TRIGGER IF EXISTS trigger_check_room_capacity ON patients;
CREATE TRIGGER trigger_check_room_capacity
BEFORE INSERT OR UPDATE OF room_id ON patients
FOR EACH ROW
EXECUTE FUNCTION check_room_capacity();

-- Create function to update room occupancy
CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
  -- If room assignment is changing
  IF OLD.room_id IS DISTINCT FROM NEW.room_id THEN
    -- Decrement old room's occupancy if exists
    IF OLD.room_id IS NOT NULL THEN
      UPDATE rooms 
      SET current_occupancy = current_occupancy - 1
      WHERE id = OLD.room_id;
    END IF;
    
    -- Increment new room's occupancy if exists
    IF NEW.room_id IS NOT NULL THEN
      UPDATE rooms 
      SET current_occupancy = current_occupancy + 1
      WHERE id = NEW.room_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room occupancy tracking
DROP TRIGGER IF EXISTS trigger_update_room_occupancy ON patients;
CREATE TRIGGER trigger_update_room_occupancy
AFTER UPDATE OF room_id ON patients
FOR EACH ROW
EXECUTE FUNCTION update_room_occupancy();

-- Create view for patient details
CREATE OR REPLACE VIEW patient_details AS
SELECT 
  p.id as patient_id,
  p.medical_record_number,
  p.date_of_birth,
  p.gender,
  p.primary_physician,
  p.emergency_contact,
  p.emergency_phone,
  p.insurance_provider,
  p.insurance_id,
  p.active,
  u.id as user_id,
  u.name,
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

-- Create view for room occupancy details
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
        'patient_id', p.id,
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

-- Create function to automatically create patient record for new users
CREATE OR REPLACE FUNCTION create_patient_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO patients (
    user_id,
    medical_record_number
  ) VALUES (
    NEW.id,
    'MRN' || LPAD(NEXTVAL('patients_mrn_seq')::TEXT, 6, '0')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for medical record numbers
CREATE SEQUENCE IF NOT EXISTS patients_mrn_seq START 1;

-- Create trigger to create patient record for new users
DROP TRIGGER IF EXISTS trigger_create_patient_for_user ON users;
CREATE TRIGGER trigger_create_patient_for_user
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_patient_for_user();

-- Fix any inconsistencies in current occupancy counts
UPDATE rooms r
SET current_occupancy = (
  SELECT COUNT(*)
  FROM patients p
  WHERE p.room_id = r.id
  AND p.active = true
);