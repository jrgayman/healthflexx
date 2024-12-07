-- Drop existing views first
DROP VIEW IF EXISTS room_occupancy_details CASCADE;
DROP VIEW IF EXISTS patient_details CASCADE;

-- Recreate room occupancy view with correct column names
CREATE OR REPLACE VIEW room_occupancy_details AS
SELECT 
  r.id as room_id,
  r.room_number,
  r.name as room_name,
  r.floor,
  r.capacity,
  r.current_occupancy,
  b.name as building_name,
  COUNT(u.id) as actual_occupancy,
  ARRAY_AGG(
    CASE 
      WHEN u.id IS NOT NULL 
      THEN jsonb_build_object(
        'id', u.id,
        'name', u.name,
        'medical_record_number', u.medical_record_number
      )
      ELSE NULL 
    END
  ) FILTER (WHERE u.id IS NOT NULL) as users
FROM rooms r
LEFT JOIN buildings b ON r.building_id = b.id
LEFT JOIN users u ON r.id = u.room_id AND u.is_patient = true
GROUP BY r.id, r.room_number, r.name, r.floor, r.capacity, r.current_occupancy, b.name;

-- Recreate patient details view
CREATE OR REPLACE VIEW patient_details AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.medical_record_number,
  u.date_of_birth,
  u.gender,
  u.primary_physician,
  u.emergency_contact,
  u.emergency_phone,
  u.insurance_provider,
  u.insurance_id,
  u.room_id,
  u.healthcare_provider_id,
  u.company_id,
  u.role_id,
  u.access_level,
  u.avatar_url,
  u.is_patient,
  u.is_medical_staff,
  c.name as company_name,
  hp.name as healthcare_provider_name,
  sr.name as role_name,
  pr.name as primary_role,
  b.name as building_name,
  r.room_number,
  r.floor
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN healthcare_specific_roles sr ON u.role_id = sr.id
LEFT JOIN healthcare_primary_roles pr ON sr.primary_role_id = pr.id
LEFT JOIN rooms r ON u.room_id = r.id
LEFT JOIN buildings b ON r.building_id = b.id
WHERE u.is_patient = true;