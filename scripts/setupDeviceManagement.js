import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDeviceManagement() {
  try {
    console.log('Setting up device management system...');

    // Read and execute SQL file
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
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

        -- Create devices table
        CREATE TABLE IF NOT EXISTS devices (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          device_type_id UUID NOT NULL REFERENCES device_types(id),
          device_name TEXT NOT NULL,
          manufacturer TEXT,
          model TEXT,
          part_number TEXT,
          serial_number TEXT NOT NULL UNIQUE,
          mac_address TEXT UNIQUE,
          firmware_version TEXT,
          qr_code TEXT UNIQUE,
          active BOOLEAN DEFAULT true,
          user_id UUID REFERENCES users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(device_type_id);
        CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices(serial_number);
        CREATE INDEX IF NOT EXISTS idx_devices_mac ON devices(mac_address);
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
          d.part_number,
          d.serial_number,
          d.mac_address,
          d.firmware_version,
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
      `
    });

    if (error) throw error;
    console.log('Device management system setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up device management:', error);
    return false;
  }
}

setupDeviceManagement()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));