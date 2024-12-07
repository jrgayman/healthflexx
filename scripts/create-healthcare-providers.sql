-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create healthcare_providers table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_name ON healthcare_providers(name);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_license ON healthcare_providers(license_number);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_active ON healthcare_providers(active);

-- Add healthcare_provider_id to users and patients
ALTER TABLE users
ADD COLUMN healthcare_provider_id UUID REFERENCES healthcare_providers(id);

ALTER TABLE patients
ADD COLUMN healthcare_provider_id UUID REFERENCES healthcare_providers(id);

-- Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_users_healthcare_provider ON users(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_patients_healthcare_provider ON patients(healthcare_provider_id);

-- Update organizations table to clarify its purpose
ALTER TABLE organizations
RENAME TO companies;

-- Rename organization_id columns to company_id
ALTER TABLE users
RENAME COLUMN organization_id TO company_id;

ALTER TABLE buildings
RENAME COLUMN organization_id TO healthcare_provider_id;

-- Update views to reflect new structure
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
  b.name as building_name,
  r.room_number,
  r.floor
FROM patients p
JOIN users u ON p.user_id = u.id
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON p.healthcare_provider_id = hp.id
LEFT JOIN rooms r ON p.room_id = r.id
LEFT JOIN buildings b ON r.building_id = b.id;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for healthcare_providers updated_at
DROP TRIGGER IF EXISTS trigger_update_healthcare_provider_timestamp ON healthcare_providers;
CREATE TRIGGER trigger_update_healthcare_provider_timestamp
BEFORE UPDATE ON healthcare_providers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create trigger for companies updated_at
DROP TRIGGER IF EXISTS trigger_update_company_timestamp ON companies;
CREATE TRIGGER trigger_update_company_timestamp
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Migrate any existing organization data to healthcare_providers
INSERT INTO healthcare_providers (
  name,
  contact_email,
  contact_phone,
  website,
  active,
  created_at,
  updated_at
)
SELECT 
  name,
  contact_email,
  contact_phone,
  website,
  active,
  created_at,
  updated_at
FROM companies
WHERE id IN (
  SELECT DISTINCT healthcare_provider_id 
  FROM buildings 
  WHERE healthcare_provider_id IS NOT NULL
);

-- Update building references to point to the new healthcare_provider records
WITH provider_mapping AS (
  SELECT 
    c.id as old_id,
    hp.id as new_id
  FROM companies c
  JOIN healthcare_providers hp ON hp.name = c.name
)
UPDATE buildings b
SET healthcare_provider_id = pm.new_id
FROM provider_mapping pm
WHERE b.healthcare_provider_id = pm.old_id;

-- Clean up any organizations that were actually healthcare providers
DELETE FROM companies
WHERE id IN (
  SELECT DISTINCT healthcare_provider_id 
  FROM buildings 
  WHERE healthcare_provider_id IS NOT NULL
);