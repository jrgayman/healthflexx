-- Create LTE hubs table
CREATE TABLE IF NOT EXISTS lte_hubs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mac_address TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_mac UNIQUE (patient_id, mac_address)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lte_hubs_patient ON lte_hubs(patient_id);
CREATE INDEX IF NOT EXISTS idx_lte_hubs_mac ON lte_hubs(mac_address);
CREATE INDEX IF NOT EXISTS idx_lte_hubs_active ON lte_hubs(active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_lte_hub_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lte_hub_timestamp ON lte_hubs;
CREATE TRIGGER trigger_update_lte_hub_timestamp
  BEFORE UPDATE ON lte_hubs
  FOR EACH ROW
  EXECUTE FUNCTION update_lte_hub_timestamp();

-- Create function to validate MAC address format
CREATE OR REPLACE FUNCTION validate_mac_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mac_address !~ '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$' THEN
    RAISE EXCEPTION 'Invalid MAC address format. Expected format: XX:XX:XX:XX:XX:XX';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_mac_address ON lte_hubs;
CREATE TRIGGER trigger_validate_mac_address
  BEFORE INSERT OR UPDATE OF mac_address ON lte_hubs
  FOR EACH ROW
  EXECUTE FUNCTION validate_mac_address();

-- Create function to enforce maximum 2 hubs per patient
CREATE OR REPLACE FUNCTION enforce_max_hubs()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM lte_hubs
    WHERE patient_id = NEW.patient_id
    AND active = true
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) >= 2 THEN
    RAISE EXCEPTION 'Maximum of 2 active LTE hubs allowed per patient';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_enforce_max_hubs ON lte_hubs;
CREATE TRIGGER trigger_enforce_max_hubs
  BEFORE INSERT OR UPDATE ON lte_hubs
  FOR EACH ROW
  EXECUTE FUNCTION enforce_max_hubs();