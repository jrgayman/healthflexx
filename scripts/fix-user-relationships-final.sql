-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing foreign key constraints
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_company_id_fkey,
DROP CONSTRAINT IF EXISTS users_healthcare_provider_id_fkey,
DROP CONSTRAINT IF EXISTS users_role_id_fkey;

-- Clear any invalid foreign key references
UPDATE users SET company_id = NULL WHERE company_id IS NOT NULL;
UPDATE users SET healthcare_provider_id = NULL WHERE healthcare_provider_id IS NOT NULL;
UPDATE users SET role_id = NULL WHERE role_id IS NOT NULL;

-- Ensure columns exist and are nullable
ALTER TABLE users
ALTER COLUMN company_id DROP NOT NULL,
ALTER COLUMN healthcare_provider_id DROP NOT NULL,
ALTER COLUMN role_id DROP NOT NULL;

-- Add foreign key constraints with ON DELETE SET NULL
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

-- Create partial indexes for better query performance (only index non-null values)
DROP INDEX IF EXISTS idx_users_company;
DROP INDEX IF EXISTS idx_users_healthcare_provider;
DROP INDEX IF EXISTS idx_users_role;

CREATE INDEX idx_users_company ON users(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_users_healthcare_provider ON users(healthcare_provider_id) WHERE healthcare_provider_id IS NOT NULL;
CREATE INDEX idx_users_role ON users(role_id) WHERE role_id IS NOT NULL;

-- Create or replace view for user details with LEFT JOINs
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