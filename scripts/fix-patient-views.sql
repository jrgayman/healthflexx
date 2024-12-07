-- Drop existing views
DROP VIEW IF EXISTS patient_details CASCADE;
DROP VIEW IF EXISTS room_occupancy_details CASCADE;

-- Recreate patient details view with consistent column names
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

-- Recreate room occupancy details view
CREATE OR REPLACE VIEW room_occupancy_details AS
SELECT 
  r.id,
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