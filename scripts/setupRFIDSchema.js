import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRFIDSchema() {
  try {
    console.log('Setting up RFID schema...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Drop existing views first
        DROP VIEW IF EXISTS rfid_status_view CASCADE;

        -- Create RFID tags table if it doesn't exist
        CREATE TABLE IF NOT EXISTS rfid_tags (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          device_type_id UUID NOT NULL REFERENCES device_types(id),
          building_id UUID NOT NULL REFERENCES buildings(id),
          room_number TEXT NOT NULL,
          serial_number TEXT NOT NULL UNIQUE,
          mac_address TEXT UNIQUE,
          status TEXT CHECK (status IN ('dry', 'wet', 'no_detection')) DEFAULT 'no_detection',
          last_changed TIMESTAMPTZ DEFAULT NOW(),
          last_scanned TIMESTAMPTZ DEFAULT NOW(),
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT unique_room_device UNIQUE (building_id, room_number)
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_building ON rfid_tags(building_id);
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_device_type ON rfid_tags(device_type_id);
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_serial ON rfid_tags(serial_number);
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_mac ON rfid_tags(mac_address);
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_status ON rfid_tags(status);
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_active ON rfid_tags(active);

        -- Create function to update timestamps
        CREATE OR REPLACE FUNCTION update_rfid_tag_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Create trigger for updated_at
        DROP TRIGGER IF EXISTS trigger_update_rfid_tag_timestamp ON rfid_tags;
        CREATE TRIGGER trigger_update_rfid_tag_timestamp
          BEFORE UPDATE ON rfid_tags
          FOR EACH ROW
          EXECUTE FUNCTION update_rfid_tag_timestamp();

        -- Create view for RFID status
        CREATE OR REPLACE VIEW rfid_status_view AS
        SELECT 
          r.id as room_id,
          r.room_number,
          r.name as room_name,
          r.floor,
          b.id as building_id,
          b.name as building_name,
          u.id as patient_id,
          u.name as patient_name,
          u.medical_record_number,
          rt.id as tag_id,
          rt.serial_number,
          rt.mac_address,
          rt.status,
          rt.last_changed,
          rt.last_scanned,
          rt.active,
          dt.name as device_type,
          dc.name as device_classification
        FROM rooms r
        LEFT JOIN buildings b ON r.building_id = b.id
        LEFT JOIN users u ON u.room_id = r.id
        LEFT JOIN rfid_tags rt ON rt.building_id = b.id AND rt.room_number = r.room_number
        LEFT JOIN device_types dt ON rt.device_type_id = dt.id
        LEFT JOIN device_classifications dc ON dt.classification_id = dc.id
        WHERE r.active = true
        ORDER BY r.floor, r.room_number;

        -- Grant permissions
        GRANT ALL ON rfid_tags TO authenticated;
        GRANT ALL ON rfid_tags TO anon;
        GRANT ALL ON rfid_status_view TO authenticated;
        GRANT ALL ON rfid_status_view TO anon;
      `
    });

    if (error) throw error;
    console.log('RFID schema setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up RFID schema:', error);
    return false;
  }
}

setupRFIDSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));