-- Drop existing views first
DROP VIEW IF EXISTS device_details CASCADE;

-- Create device classifications table
CREATE TABLE IF NOT EXISTS device_classifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update device types table with additional fields
CREATE TABLE IF NOT EXISTS device_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  classification_id UUID NOT NULL REFERENCES device_classifications(id),
  name TEXT NOT NULL,
  description TEXT,
  manufacturer TEXT,
  model TEXT,
  part_number TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classification_id, name)
);

-- Update devices table to be simpler
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_type_id UUID NOT NULL REFERENCES device_types(id),
  serial_number TEXT UNIQUE,
  mac_address TEXT UNIQUE,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(device_type_id);
CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devices_mac ON devices(mac_address) WHERE mac_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices(active);
CREATE INDEX IF NOT EXISTS idx_device_types_classification ON device_types(classification_id);

-- Create view for device details
CREATE OR REPLACE VIEW device_details AS
SELECT 
  d.id,
  dt.name as device_name,
  dt.manufacturer,
  dt.model,
  dt.part_number,
  d.serial_number,
  d.mac_address,
  d.notes,
  d.active,
  dt.image_url as device_image_url,
  dt.name as device_type,
  dc.name as classification,
  dc.image_url as classification_image_url,
  u.id as user_id,
  u.name as user_name,
  u.medical_record_number,
  hp.name as provider_name,
  c.name as organization_name,
  d.created_at
FROM devices d
JOIN device_types dt ON d.device_type_id = dt.id
JOIN device_classifications dc ON dt.classification_id = dc.id
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN companies c ON u.company_id = c.id;

-- Grant permissions
GRANT ALL ON device_classifications TO authenticated;
GRANT ALL ON device_types TO authenticated;
GRANT ALL ON devices TO authenticated;
GRANT ALL ON device_details TO authenticated;