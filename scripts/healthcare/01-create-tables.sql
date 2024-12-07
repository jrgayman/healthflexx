-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create primary roles table
CREATE TABLE IF NOT EXISTS healthcare_primary_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create specific roles table
CREATE TABLE IF NOT EXISTS healthcare_specific_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  primary_role_id UUID NOT NULL REFERENCES healthcare_primary_roles(id),
  description TEXT,
  qualifications TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, primary_role_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_healthcare_specific_roles_primary_role 
ON healthcare_specific_roles(primary_role_id);

CREATE INDEX IF NOT EXISTS idx_healthcare_specific_roles_active 
ON healthcare_specific_roles(active);