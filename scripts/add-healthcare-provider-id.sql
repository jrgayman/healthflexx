-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create healthcare_providers table if it doesn't exist
CREATE TABLE IF NOT EXISTS healthcare_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  license_number TEXT,
  tax_id TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for healthcare_providers
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_name ON healthcare_providers(name);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_license ON healthcare_providers(license_number);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_active ON healthcare_providers(active);

-- Add healthcare_provider_id to buildings
ALTER TABLE buildings
ADD COLUMN IF NOT EXISTS healthcare_provider_id UUID REFERENCES healthcare_providers(id);

-- Add healthcare_provider_id to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS healthcare_provider_id UUID REFERENCES healthcare_providers(id);

-- Add healthcare_provider_id to patients
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS healthcare_provider_id UUID REFERENCES healthcare_providers(id);

-- Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_buildings_healthcare_provider ON buildings(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_users_healthcare_provider ON users(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_patients_healthcare_provider ON patients(healthcare_provider_id);

-- Update patient_details view to include healthcare provider info
DROP VIEW IF EXISTS patient_details CASCADE;

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

-- Update room_occupancy_details view to include healthcare provider info
DROP VIEW IF EXISTS room_occupancy_details CASCADE;

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