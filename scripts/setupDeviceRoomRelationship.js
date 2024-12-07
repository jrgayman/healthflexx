import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDeviceRoomRelationship() {
  try {
    console.log('Setting up device-room relationship...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add room_id to devices table
        ALTER TABLE devices
        ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;

        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_devices_room ON devices(room_id);

        -- Update existing devices to link with rooms based on user assignments
        UPDATE devices d
        SET room_id = u.room_id
        FROM users u
        WHERE d.user_id = u.id
        AND d.room_id IS NULL;

        -- Create view for room devices
        CREATE OR REPLACE VIEW room_devices AS
        SELECT 
          r.id as room_id,
          r.room_number,
          r.name as room_name,
          r.floor,
          b.name as building_name,
          u.id as user_id,
          u.name as user_name,
          u.medical_record_number,
          d.id as device_id,
          d.serial_number,
          d.mac_address,
          dt.name as device_type,
          dc.name as device_classification
        FROM rooms r
        LEFT JOIN buildings b ON r.building_id = b.id
        LEFT JOIN users u ON u.room_id = r.id
        LEFT JOIN devices d ON d.room_id = r.id
        LEFT JOIN device_types dt ON d.device_type_id = dt.id
        LEFT JOIN device_classifications dc ON dt.classification_id = dc.id
        WHERE r.active = true
        ORDER BY r.floor, r.room_number;

        -- Grant permissions
        GRANT ALL ON room_devices TO authenticated;
        GRANT ALL ON room_devices TO anon;
      `
    });

    if (error) throw error;
    console.log('Device-room relationship setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up device-room relationship:', error);
    return false;
  }
}

setupDeviceRoomRelationship()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));