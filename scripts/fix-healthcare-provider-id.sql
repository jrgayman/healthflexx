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

-- Add healthcare_provider_id to relevant tables
ALTER TABLE users
DROP COLUMN IF EXISTS healthcare_provider_id CASCADE;

ALTER TABLE users
ADD COLUMN healthcare_provider_id UUID REFERENCES healthcare_providers(id);

ALTER TABLE companies
DROP COLUMN IF EXISTS healthcare_provider_id CASCADE;

ALTER TABLE companies
ADD COLUMN healthcare_provider_id UUID REFERENCES healthcare_providers(id);

ALTER TABLE buildings
DROP COLUMN IF EXISTS healthcare_provider_id CASCADE;

ALTER TABLE buildings
ADD COLUMN healthcare_provider_id UUID REFERENCES healthcare_providers(id);

ALTER TABLE patients
DROP COLUMN IF EXISTS healthcare_provider_id CASCADE;

ALTER TABLE patients
ADD COLUMN healthcare_provider_id UUID REFERENCES healthcare_providers(id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_healthcare_provider ON users(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_companies_healthcare_provider ON companies(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_buildings_healthcare_provider ON buildings(healthcare_provider_id);
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