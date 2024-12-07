-- First, ensure we have UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing user_devices table to rebuild with proper structure
DROP TABLE IF EXISTS user_devices CASCADE;

-- Create devices table with proper structure
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default device types
INSERT INTO devices (name) VALUES
  ('6-in-1'),
  ('Health Scale'),
  ('Health Band'),
  ('Glucose Monitor'),
  ('Blood Pressure')
ON CONFLICT (name) DO NOTHING;

-- Create user_devices junction table with device details
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  serial_number TEXT,
  mac_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_device UNIQUE (user_id, device_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_device_id ON user_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_serial_number ON user_devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_user_devices_mac_address ON user_devices(mac_address);

-- Create unique indexes for serial number and mac address
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_devices_serial_number_unique 
ON user_devices(serial_number) 
WHERE serial_number IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_devices_mac_address_unique 
ON user_devices(mac_address) 
WHERE mac_address IS NOT NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_devices_updated_at ON user_devices;
CREATE TRIGGER update_user_devices_updated_at
  BEFORE UPDATE ON user_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for easier querying of device information
DROP VIEW IF EXISTS device_details;
CREATE VIEW device_details AS
SELECT 
  ud.id,
  ud.user_id,
  u.name as user_name,
  u.email as user_email,
  ud.device_id,
  d.name as device_type,
  ud.serial_number,
  ud.mac_address,
  ud.created_at,
  ud.updated_at
FROM user_devices ud
JOIN users u ON ud.user_id = u.id
JOIN devices d ON ud.device_id = d.id;