-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing constraints
ALTER TABLE buildings
DROP CONSTRAINT IF EXISTS buildings_organization_id_fkey,
DROP CONSTRAINT IF EXISTS buildings_healthcare_provider_id_fkey;

-- Update buildings table structure
ALTER TABLE buildings
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN address DROP NOT NULL,
ALTER COLUMN city DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL,
ALTER COLUMN zip DROP NOT NULL,
ALTER COLUMN phone DROP NOT NULL;

-- Add healthcare_provider_id foreign key
ALTER TABLE buildings
ADD CONSTRAINT buildings_healthcare_provider_id_fkey
FOREIGN KEY (healthcare_provider_id)
REFERENCES healthcare_providers(id)
ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_buildings_healthcare_provider ON buildings(healthcare_provider_id);
CREATE INDEX IF NOT EXISTS idx_buildings_name ON buildings(name);
CREATE INDEX IF NOT EXISTS idx_buildings_active ON buildings(active);