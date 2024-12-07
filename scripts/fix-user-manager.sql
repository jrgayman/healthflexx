-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing foreign key constraints
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_company_id_fkey,
DROP CONSTRAINT IF EXISTS users_healthcare_provider_id_fkey,
DROP CONSTRAINT IF EXISTS users_role_id_fkey;

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

-- Create companies table if it doesn't exist
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

-- Add columns to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS company_id UUID,
ADD COLUMN IF NOT EXISTS healthcare_provider_id UUID,
ADD COLUMN IF NOT EXISTS role_id UUID;

-- Add foreign key constraints that allow NULL values
ALTER TABLE users
ADD CONSTRAINT users_company_id_fkey 
  FOREIGN KEY (company_id) 
  REFERENCES companies(id) 
  ON DELETE SET NULL,
ADD CONSTRAINT users_healthcare_provider_id_fkey 
  FOREIGN KEY (healthcare_provider_id) 
  REFERENCES healthcare_providers(id) 
  ON DELETE SET NULL,
ADD CONSTRAINT users_role_id_fkey 
  FOREIGN KEY (role_id) 
  REFERENCES healthcare_specific_roles(id) 
  ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_healthcare_provider ON users(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

-- Create default company and provider if they don't exist
INSERT INTO healthcare_providers (name, contact_email, website, active)
VALUES (
  'HealthFlexx Inc.',
  'admin@healthflexxinc.com',
  'https://healthflexxinc.com',
  true
)
ON CONFLICT DO NOTHING;

WITH provider AS (
  SELECT id FROM healthcare_providers WHERE name = 'HealthFlexx Inc.' LIMIT 1
)
INSERT INTO companies (name, industry, contact_email, website, healthcare_provider_id, active)
VALUES (
  'HealthFlexx General',
  'Healthcare',
  'support@healthflexxinc.com',
  'https://healthflexxinc.com',
  (SELECT id FROM provider),
  true
)
ON CONFLICT DO NOTHING;

-- Create view for user details
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
  u.role_id,
  sr.name as role_name,
  pr.name as primary_role
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN healthcare_specific_roles sr ON u.role_id = sr.id
LEFT JOIN healthcare_primary_roles pr ON sr.primary_role_id = pr.id;