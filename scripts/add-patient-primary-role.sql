-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add Patient to primary roles
INSERT INTO healthcare_primary_roles (name, description)
VALUES ('Patient', 'Healthcare recipients and medical care patients')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Create user_roles junction table for multiple roles if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES healthcare_specific_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Update user details view to include all roles
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
      'id', sr.id,
      'name', sr.name,
      'primary_role', pr.name
    )
  ) FILTER (WHERE sr.id IS NOT NULL) as roles
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN healthcare_specific_roles sr ON ur.role_id = sr.id
LEFT JOIN healthcare_primary_roles pr ON sr.primary_role_id = pr.id
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