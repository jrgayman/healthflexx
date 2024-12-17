-- Drop existing table and recreate with time slot support
DROP TABLE IF EXISTS bluetooth_devices CASCADE;

CREATE TABLE bluetooth_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES medication_sessions(id) ON DELETE CASCADE,
  time_slot TEXT NOT NULL CHECK (time_slot IN ('morning', 'noon', 'afternoon', 'evening')),
  mac_address TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_time_slot UNIQUE (session_id, time_slot)
);

-- Create indexes
CREATE INDEX idx_bluetooth_devices_session ON bluetooth_devices(session_id);
CREATE INDEX idx_bluetooth_devices_time_slot ON bluetooth_devices(time_slot);
CREATE INDEX idx_bluetooth_devices_mac ON bluetooth_devices(mac_address);
CREATE INDEX idx_bluetooth_devices_active ON bluetooth_devices(active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_bluetooth_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bluetooth_device_timestamp
  BEFORE UPDATE ON bluetooth_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_bluetooth_device_timestamp();

-- Create function to validate MAC address format
CREATE OR REPLACE FUNCTION validate_bluetooth_mac_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mac_address !~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$' THEN
    RAISE EXCEPTION 'Invalid MAC address format. Expected format: XX:XX:XX:XX:XX:XX';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_bluetooth_mac_address
  BEFORE INSERT OR UPDATE OF mac_address ON bluetooth_devices
  FOR EACH ROW
  EXECUTE FUNCTION validate_bluetooth_mac_address();