-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing views that might reference the old structure
DROP VIEW IF EXISTS healthcare_roles_view CASCADE;
DROP VIEW IF EXISTS user_details CASCADE;

-- Drop existing tables to rebuild them
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS healthcare_roles CASCADE;

-- Create healthcare roles table
CREATE TABLE healthcare_roles_primary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_healthcare_roles_primary_active ON healthcare_roles_primary(active);

-- Insert roles
INSERT INTO healthcare_roles_primary (name, description) VALUES 
  ('Administrator', 'Healthcare administration and management roles'),
  ('Nurse', 'Nursing and patient care professionals'),
  ('Patient', 'Healthcare recipients and medical care patients'),
  ('Physician', 'Medical doctors and specialists'),
  ('Telehealth Operations Manager', 'Manages telehealth operations and staff scheduling'),
  ('Virtual Care Coordinator', 'Coordinates virtual appointments and patient care'),
  ('Telehealth Technical Support', 'Provides technical support for virtual care sessions')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Create user_roles junction table
CREATE TABLE user_roles (
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
      'id', hr.id,
      'name', hr.name,
      'description', hr.description
    )
  ) FILTER (WHERE hr.id IS NOT NULL) as roles
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN healthcare_roles_primary hr ON ur.role_id = hr.id
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