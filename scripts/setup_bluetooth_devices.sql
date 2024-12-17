```sql
-- Create bluetooth_devices table
CREATE TABLE IF NOT EXISTS bluetooth_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES medication_sessions(id) ON DELETE CASCADE,
  mac_address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_mac UNIQUE (session_id, mac_address)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bluetooth_devices_session ON bluetooth_devices(session_id);
CREATE INDEX IF NOT EXISTS idx_bluetooth_devices_mac ON bluetooth_devices(mac_address);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_bluetooth_device_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_bluetooth_device_timestamp ON bluetooth_devices;
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

DROP TRIGGER IF EXISTS trigger_validate_bluetooth_mac_address ON bluetooth_devices;
CREATE TRIGGER trigger_validate_bluetooth_mac_address
  BEFORE INSERT OR UPDATE OF mac_address ON bluetooth_devices
  FOR EACH ROW
  EXECUTE FUNCTION validate_bluetooth_mac_address();

-- Create function to enforce one device per session
CREATE OR REPLACE FUNCTION enforce_one_device_per_session()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM bluetooth_devices
    WHERE session_id = NEW.session_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) >= 1 THEN
    RAISE EXCEPTION 'Only one Bluetooth device allowed per session';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_one_device_per_session ON bluetooth_devices;
CREATE TRIGGER trigger_enforce_one_device_per_session
  BEFORE INSERT OR UPDATE ON bluetooth_devices
  FOR EACH ROW
  EXECUTE FUNCTION enforce_one_device_per_session();
```