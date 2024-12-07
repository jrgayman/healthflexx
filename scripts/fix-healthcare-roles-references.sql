-- Drop old views that might reference the wrong table
DROP VIEW IF EXISTS user_details CASCADE;
DROP VIEW IF EXISTS patient_details CASCADE;
DROP VIEW IF EXISTS room_occupancy_details CASCADE;

-- Drop old tables and relationships
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS healthcare_roles CASCADE;
DROP TABLE IF EXISTS healthcare_specific_roles CASCADE;
DROP TABLE IF EXISTS healthcare_primary_roles CASCADE;

-- Create healthcare_roles_primary if it doesn't exist
CREATE TABLE IF NOT EXISTS healthcare_roles_primary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert standard roles
INSERT INTO healthcare_roles_primary (name, description) VALUES 
  ('Administrator', 'Healthcare administration and management roles'),
  ('Physician', 'Medical doctors and specialists'),
  ('Nurse', 'Nursing and patient care professionals'),
  ('Patient', 'Healthcare recipients and medical care patients'),
  ('Telehealth Operations Manager', 'Manages telehealth operations and staff scheduling'),
  ('Virtual Care Coordinator', 'Coordinates virtual appointments and patient care'),
  ('Telehealth Technical Support', 'Provides technical support for virtual care sessions')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES healthcare_roles_primary(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Recreate user_details view
CREATE OR REPLACE VIEW user_details AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.access_level,
  u.avatar_url,
  u.company_id,
  c.name as company_name,
  u.healthcare_provider_id,
  hp.name as provider_name,
  ARRAY_AGG(
    jsonb_build_object(
      'id', r.id,
      'name', r.name,
      'description', r.description
    )
  ) FILTER (WHERE r.id IS NOT NULL) as roles
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN healthcare_roles_primary r ON ur.role_id = r.id
GROUP BY 
  u.id, 
  u.name, 
  u.email, 
  u.phone, 
  u.access_level, 
  u.avatar_url,
  u.company_id,
  c.name,
  u.healthcare_provider_id,
  hp.name;

-- Recreate patient_details view
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
  u.access_level,
  u.avatar_url,
  c.name as company_name,
  hp.name as provider_name,
  r.name as role_name,
  b.name as building_name,
  rm.room_number,
  rm.floor
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN healthcare_roles_primary r ON ur.role_id = r.id
LEFT JOIN rooms rm ON u.room_id = rm.id
LEFT JOIN buildings b ON rm.building_id = b.id
WHERE EXISTS (
  SELECT 1 FROM user_roles ur2
  JOIN healthcare_roles_primary r2 ON ur2.role_id = r2.id
  WHERE ur2.user_id = u.id AND r2.name = 'Patient'
);

-- Recreate room_occupancy_details view
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
LEFT JOIN users u ON r.id = u.room_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN healthcare_roles_primary hr ON ur.role_id = hr.id AND hr.name = 'Patient'
GROUP BY r.id, r.room_number, r.name, r.floor, r.capacity, r.current_occupancy, b.name;