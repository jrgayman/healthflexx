-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create device classifications table
CREATE TABLE IF NOT EXISTS device_classifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create device types table
CREATE TABLE IF NOT EXISTS device_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  classification_id UUID NOT NULL REFERENCES device_classifications(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classification_id, name)
);

-- Create unified devices table
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_type_id UUID NOT NULL REFERENCES device_types(id),
  device_name TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
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

-- Insert default classifications
INSERT INTO device_classifications (name, description) 
VALUES 
  ('Wearable Healthband', 'Health monitoring wearable devices'),
  ('Medication Adherence', 'Medication tracking and reminder devices'),
  ('Incontinence Scanner', 'Devices for monitoring incontinence'),
  ('Remote Patient Monitor', 'RPM devices for vital signs monitoring')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Insert default device types
WITH classifications AS (
  SELECT id, name FROM device_classifications
)
INSERT INTO device_types (classification_id, name, description)
VALUES
  -- RPM Devices
  ((SELECT id FROM classifications WHERE name = 'Remote Patient Monitor'),
   '6-in-1', 'Multi-parameter vital signs monitoring device'),
  ((SELECT id FROM classifications WHERE name = 'Remote Patient Monitor'),
   'Health Scale', 'Digital weight and body composition scale'),
  ((SELECT id FROM classifications WHERE name = 'Remote Patient Monitor'),
   'Glucose Monitor', 'Blood glucose monitoring device'),
  ((SELECT id FROM classifications WHERE name = 'Remote Patient Monitor'),
   'Otoscope', 'Digital otoscope for ear examination'),
  ((SELECT id FROM classifications WHERE name = 'Remote Patient Monitor'),
   'Stethoscope', 'Digital stethoscope for heart and lung sounds'),
  ((SELECT id FROM classifications WHERE name = 'Remote Patient Monitor'),
   'Blood Pressure', 'Blood pressure monitoring device'),
  ((SELECT id FROM classifications WHERE name = 'Remote Patient Monitor'),
   'Blood Oxygen', 'Blood oxygen saturation monitor'),
  ((SELECT id FROM classifications WHERE name = 'Remote Patient Monitor'),
   'Temperature', 'Digital thermometer'),

  -- Medication Adherence Devices
  ((SELECT id FROM classifications WHERE name = 'Medication Adherence'),
   'Smart Pill Box', 'Connected medication dispenser with reminders'),
  ((SELECT id FROM classifications WHERE name = 'Medication Adherence'),
   'Smart Cap', 'Medication bottle cap with adherence tracking'),

  -- Wearable Devices
  ((SELECT id FROM classifications WHERE name = 'Wearable Healthband'),
   'Health Band', 'Wearable device for continuous health monitoring'),
  ((SELECT id FROM classifications WHERE name = 'Wearable Healthband'),
   'Smart Watch', 'Health monitoring smartwatch'),

  -- Incontinence Devices
  ((SELECT id FROM classifications WHERE name = 'Incontinence Scanner'),
   'RFID Scanner', 'RFID-based incontinence monitoring device')
ON CONFLICT (classification_id, name) DO UPDATE 
SET description = EXCLUDED.description;

-- Create view for device details
CREATE OR REPLACE VIEW device_details AS
SELECT 
  d.id,
  d.device_name,
  d.manufacturer,
  d.model,
  d.serial_number,
  d.mac_address,
  d.notes,
  d.active,
  dt.name as device_type,
  dc.name as classification,
  u.id as user_id,
  u.name as user_name,
  u.medical_record_number,
  hp.name as provider_name,
  c.name as organization_name
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