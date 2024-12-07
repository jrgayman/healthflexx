-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create healthcare_roles_primary table
CREATE TABLE IF NOT EXISTS healthcare_roles_primary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert primary roles
INSERT INTO healthcare_roles_primary (name, description) 
VALUES 
  ('Administrator', 'Healthcare administration and management roles'),
  ('Nurse', 'Nursing and patient care professionals'),
  ('Patient', 'Healthcare recipients and medical care patients'),
  ('Physician', 'Medical doctors and specialists')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_healthcare_roles_primary_name 
ON healthcare_roles_primary(name);