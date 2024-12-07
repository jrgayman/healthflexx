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

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  tax_id TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  healthcare_provider_id UUID REFERENCES healthcare_providers(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_name ON healthcare_providers(name);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_license ON healthcare_providers(license_number);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_active ON healthcare_providers(active);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_healthcare_provider ON companies(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(active);

-- Migrate existing organizations to appropriate tables
INSERT INTO healthcare_providers (
  id,
  name,
  contact_email,
  contact_phone,
  website,
  active,
  created_at,
  updated_at
)
SELECT 
  id,
  name,
  contact_email,
  contact_phone,
  website,
  active,
  created_at,
  updated_at
FROM organizations
WHERE id IN (
  SELECT DISTINCT organization_id 
  FROM buildings 
  WHERE organization_id IS NOT NULL
);

-- Move remaining organizations to companies
INSERT INTO companies (
  id,
  name,
  contact_email,
  contact_phone,
  website,
  active,
  created_at,
  updated_at
)
SELECT 
  id,
  name,
  contact_email,
  contact_phone,
  website,
  active,
  created_at,
  updated_at
FROM organizations
WHERE id NOT IN (
  SELECT id FROM healthcare_providers
);

-- Update foreign key references
ALTER TABLE buildings
DROP CONSTRAINT IF EXISTS buildings_organization_id_fkey;

ALTER TABLE buildings
RENAME COLUMN organization_id TO healthcare_provider_id;

ALTER TABLE buildings
ADD CONSTRAINT buildings_healthcare_provider_fkey 
FOREIGN KEY (healthcare_provider_id) 
REFERENCES healthcare_providers(id);

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_organization_id_fkey;

ALTER TABLE users
RENAME COLUMN organization_id TO company_id;

ALTER TABLE users
ADD CONSTRAINT users_company_fkey 
FOREIGN KEY (company_id) 
REFERENCES companies(id);

-- Add healthcare_provider_id to users and patients
ALTER TABLE users
ADD COLUMN healthcare_provider_id UUID REFERENCES healthcare_providers(id);

ALTER TABLE patients
ADD COLUMN healthcare_provider_id UUID REFERENCES healthcare_providers(id);

-- Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_users_healthcare_provider ON users(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_patients_healthcare_provider ON patients(healthcare_provider_id);

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

-- Drop old organizations table
DROP TABLE organizations CASCADE;