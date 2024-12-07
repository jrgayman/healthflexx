-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create patient medications table
CREATE TABLE IF NOT EXISTS patient_medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  medication_id UUID NOT NULL REFERENCES medications(id),
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication adherence devices table
CREATE TABLE IF NOT EXISTS medication_adherence_devices (
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
CREATE INDEX IF NOT EXISTS idx_patient_medications_user ON patient_medications(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_medication ON patient_medications(medication_id);
CREATE INDEX IF NOT EXISTS idx_patient_medications_active ON patient_medications(active);

CREATE INDEX IF NOT EXISTS idx_med_adherence_devices_serial ON medication_adherence_devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_med_adherence_devices_mac ON medication_adherence_devices(mac_address);
CREATE INDEX IF NOT EXISTS idx_med_adherence_devices_user ON medication_adherence_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_med_adherence_devices_active ON medication_adherence_devices(active);

-- Create view for patient medication details
CREATE OR REPLACE VIEW patient_medication_details AS
SELECT 
  pm.id,
  pm.user_id,
  u.name as patient_name,
  u.medical_record_number,
  m.brand_name as medication_name,
  m.generic_name,
  pm.dosage,
  pm.frequency,
  pm.start_date,
  pm.end_date,
  pm.instructions,
  pm.active,
  mad.id as device_id,
  mad.device_name,
  mad.serial_number as device_serial,
  mad.mac_address as device_mac,
  mad.manufacturer as device_manufacturer,
  hp.name as provider_name,
  c.name as organization_name
FROM patient_medications pm
JOIN users u ON pm.user_id = u.id
JOIN medications m ON pm.medication_id = m.id
LEFT JOIN medication_adherence_devices mad ON mad.user_id = u.id
LEFT JOIN healthcare_providers hp ON u.healthcare_provider_id = hp.id
LEFT JOIN companies c ON u.company_id = c.id;

-- Grant necessary permissions
GRANT ALL ON patient_medications TO authenticated;
GRANT ALL ON medication_adherence_devices TO authenticated;
GRANT ALL ON patient_medication_details TO authenticated;