-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing constraints if they exist
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_id_fkey;

-- Add role_id column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES healthcare_roles_primary(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

-- Create user_roles junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES healthcare_roles_primary(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Update user details view to include roles
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