-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create medication monitoring devices table
CREATE TABLE IF NOT EXISTS medication_monitoring_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_name TEXT NOT NULL,
  serial_number TEXT NOT NULL UNIQUE,
  mac_address TEXT UNIQUE,
  manufacturer TEXT,
  model TEXT,
  firmware_version TEXT,
  active BOOLEAN DEFAULT true,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_med_monitoring_devices_serial ON medication_monitoring_devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_med_monitoring_devices_mac ON medication_monitoring_devices(mac_address);
CREATE INDEX IF NOT EXISTS idx_med_monitoring_devices_user ON medication_monitoring_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_med_monitoring_devices_active ON medication_monitoring_devices(active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_med_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_med_device_timestamp ON medication_monitoring_devices;
CREATE TRIGGER trigger_update_med_device_timestamp
  BEFORE UPDATE ON medication_monitoring_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_med_device_timestamp();

-- Create view for device assignments
CREATE OR REPLACE VIEW medication_device_assignments AS
SELECT 
  d.id as device_id,
  d.device_name,
  d.serial_number,
  d.mac_address,
  d.manufacturer,
  d.model,
  d.firmware_version,
  d.active,
  u.id as user_id,
  u.name as user_name,
  u.medical_record_number,
  hp.id as provider_id,
  hp.name as provider_name,
  c.id as company_id,
  c.name as company_name
FROM medication_monitoring_devices d
LEFT JOIN users u ON d.user_id = u.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN companies c ON u.company_id = c.id;

-- Grant necessary permissions
GRANT ALL ON medication_monitoring_devices TO authenticated;
GRANT ALL ON medication_monitoring_devices TO anon;
GRANT ALL ON medication_device_assignments TO authenticated;
GRANT ALL ON medication_device_assignments TO anon;