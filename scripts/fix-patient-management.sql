-- Drop existing views
DROP VIEW IF EXISTS patient_details CASCADE;
DROP VIEW IF EXISTS room_occupancy_details CASCADE;

-- Create updated patient details view with healthcare provider info
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
  p.healthcare_provider_id,
  u.id as user_id,
  u.name as patient_name,
  u.email,
  u.phone,
  u.access_level,
  u.avatar_url,
  u.company_id,
  c.name as company_name,
  hp.name as healthcare_provider_name,
  hp.license_number as healthcare_provider_license,
  b.name as building_name,
  r.room_number,
  r.floor
FROM patients p
JOIN users u ON p.user_id = u.id
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON p.healthcare_provider_id = hp.id
LEFT JOIN rooms r ON p.room_id = r.id
LEFT JOIN buildings b ON r.building_id = b.id;

-- Create updated room occupancy view
CREATE OR REPLACE VIEW room_occupancy_details AS
SELECT 
  r.id as room_id,
  r.room_number,
  r.name as room_name,
  r.floor,
  r.capacity,
  r.current_occupancy,
  b.name as building_name,
  hp.name as healthcare_provider_name,
  COUNT(p.id) as actual_occupancy,
  ARRAY_AGG(
    CASE 
      WHEN p.id IS NOT NULL 
      THEN jsonb_build_object(
        'id', p.id,
        'user_id', u.id,
        'name', u.name,
        'medical_record_number', p.medical_record_number,
        'avatar_url', u.avatar_url
      )
      ELSE NULL 
    END
  ) FILTER (WHERE p.id IS NOT NULL) as patients
FROM rooms r
LEFT JOIN buildings b ON r.building_id = b.id
LEFT JOIN healthcare_providers hp ON b.healthcare_provider_id = hp.id
LEFT JOIN patients p ON r.id = p.room_id AND p.active = true
LEFT JOIN users u ON p.user_id = u.id
GROUP BY r.id, r.room_number, r.name, r.floor, r.capacity, r.current_occupancy, b.name, hp.name;

-- Create function to ensure patient records exist
CREATE OR REPLACE FUNCTION ensure_patient_records()
RETURNS void AS $$
BEGIN
  -- Create patient records for any users that don't have one
  INSERT INTO patients (
    user_id,
    medical_record_number,
    healthcare_provider_id
  )
  SELECT 
    u.id,
    'MRN' || LPAD(NEXTVAL('patients_mrn_seq')::TEXT, 6, '0'),
    u.healthcare_provider_id
  FROM users u
  WHERE NOT EXISTS (
    SELECT 1 
    FROM patients p 
    WHERE p.user_id = u.id
  );
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create any missing patient records
SELECT ensure_patient_records();

-- Create trigger to automatically create patient records for new users
CREATE OR REPLACE FUNCTION create_patient_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO patients (
    user_id,
    medical_record_number,
    healthcare_provider_id
  ) VALUES (
    NEW.id,
    'MRN' || LPAD(NEXTVAL('patients_mrn_seq')::TEXT, 6, '0'),
    NEW.healthcare_provider_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS trigger_create_patient_record ON users;
CREATE TRIGGER trigger_create_patient_record
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_patient_record();