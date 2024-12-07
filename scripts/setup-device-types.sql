-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create manufacturers table
CREATE TABLE IF NOT EXISTS device_manufacturers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create device models table
CREATE TABLE IF NOT EXISTS device_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  manufacturer_id UUID NOT NULL REFERENCES device_manufacturers(id),
  name TEXT NOT NULL,
  model_number TEXT,
  description TEXT,
  specifications JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(manufacturer_id, model_number)
);

-- Add new columns to device_types table
ALTER TABLE device_types
ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES device_models(id),
ADD COLUMN IF NOT EXISTS default_part_number TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_device_manufacturers_name ON device_manufacturers(name);
CREATE INDEX IF NOT EXISTS idx_device_manufacturers_active ON device_manufacturers(active);
CREATE INDEX IF NOT EXISTS idx_device_models_manufacturer ON device_models(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_device_models_active ON device_models(active);
CREATE INDEX IF NOT EXISTS idx_device_types_model ON device_types(model_id);

-- Drop existing view if it exists
DROP VIEW IF EXISTS device_details;

-- Create fresh device_details view
CREATE VIEW device_details AS
SELECT 
  d.id,
  d.device_name,
  d.serial_number,
  d.mac_address,
  d.notes,
  d.active,
  d.created_at,
  d.user_id,
  dt.name as device_type,
  dt.description as type_description,
  dc.name as classification,
  dc.description as classification_description,
  dm.name as model_name,
  dm.model_number,
  dman.name as manufacturer_name,
  u.name as assigned_to,
  u.email as user_email,
  hp.name as provider_name
FROM devices d
JOIN device_types dt ON d.device_type_id = dt.id
JOIN device_classifications dc ON dt.classification_id = dc.id
LEFT JOIN device_models dm ON dt.model_id = dm.id
LEFT JOIN device_manufacturers dman ON dm.manufacturer_id = dman.id
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id;

-- Grant necessary permissions
GRANT ALL ON device_manufacturers TO authenticated;
GRANT ALL ON device_models TO authenticated;
GRANT ALL ON device_details TO authenticated;