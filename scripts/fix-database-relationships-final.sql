-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing constraints that force relationships
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_company_id_fkey,
DROP CONSTRAINT IF EXISTS users_healthcare_provider_id_fkey;

-- Recreate constraints to allow NULL values
ALTER TABLE users
ADD CONSTRAINT users_company_id_fkey 
  FOREIGN KEY (company_id) 
  REFERENCES companies(id)
  ON DELETE SET NULL,
ADD CONSTRAINT users_healthcare_provider_id_fkey 
  FOREIGN KEY (healthcare_provider_id) 
  REFERENCES healthcare_providers(id)
  ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_healthcare_provider ON users(healthcare_provider_id);

-- Create view for user details with optional relationships
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