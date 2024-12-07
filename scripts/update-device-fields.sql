-- Update user_devices table to include device-specific information
ALTER TABLE user_devices
ADD COLUMN IF NOT EXISTS serial_number TEXT,
ADD COLUMN IF NOT EXISTS mac_address TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_devices_serial_number ON user_devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_user_devices_mac_address ON user_devices(mac_address);