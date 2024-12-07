import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRFIDTagSchema() {
  try {
    console.log('Setting up RFID tag schema...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Drop existing views first
        DROP VIEW IF EXISTS rfid_tag_history CASCADE;
        DROP VIEW IF EXISTS patient_rfid_status CASCADE;

        -- Create RFID tags table if it doesn't exist
        CREATE TABLE IF NOT EXISTS rfid_tags (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          tag_id TEXT NOT NULL UNIQUE,
          user_id UUID NOT NULL REFERENCES users(id),
          status TEXT CHECK (status IN ('dry', 'wet', 'no_detection')) DEFAULT 'no_detection',
          last_changed TIMESTAMPTZ DEFAULT NOW(),
          last_scanned TIMESTAMPTZ DEFAULT NOW(),
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_tag_id ON rfid_tags(tag_id);
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_user ON rfid_tags(user_id);
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_status ON rfid_tags(status);
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_active ON rfid_tags(active);

        -- Create function to update timestamps
        CREATE OR REPLACE FUNCTION update_rfid_tag_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Update last_changed only if status changed
          IF NEW.status != OLD.status THEN
            NEW.last_changed = NOW();
          END IF;
          
          -- Always update last_scanned and updated_at
          NEW.last_scanned = NOW();
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

        -- Create view for RFID tag history with room info through patient
        CREATE OR REPLACE VIEW rfid_tag_history AS
        SELECT 
          rt.id,
          rt.tag_id,
          rt.status,
          rt.last_changed,
          rt.last_scanned,
          rt.active,
          u.id as user_id,
          u.name as patient_name,
          u.medical_record_number,
          r.room_number,
          r.floor,
          b.name as building_name,
          rt.created_at,
          rt.updated_at
        FROM rfid_tags rt
        JOIN users u ON rt.user_id = u.id
        LEFT JOIN rooms r ON u.room_id = r.id
        LEFT JOIN buildings b ON r.building_id = b.id
        ORDER BY rt.created_at DESC;

        -- Create view for patient RFID status
        CREATE OR REPLACE VIEW patient_rfid_status AS
        SELECT 
          u.id as user_id,
          u.name as patient_name,
          u.medical_record_number,
          r.id as room_id,
          r.room_number,
          r.floor,
          b.id as building_id,
          b.name as building_name,
          COUNT(rt.id) as total_tags_used,
          COUNT(CASE WHEN rt.created_at > NOW() - INTERVAL '24 HOURS' THEN 1 END) as tags_used_today,
          COUNT(CASE WHEN rt.status = 'wet' THEN 1 END) as wet_tags,
          COUNT(CASE WHEN rt.status = 'dry' THEN 1 END) as dry_tags,
          COUNT(CASE WHEN rt.status = 'no_detection' THEN 1 END) as no_detection_tags,
          MAX(rt.last_changed) as last_status_change,
          MAX(rt.last_scanned) as last_scan
        FROM users u
        LEFT JOIN rooms r ON u.room_id = r.id
        LEFT JOIN buildings b ON r.building_id = b.id
        LEFT JOIN rfid_tags rt ON rt.user_id = u.id
        GROUP BY u.id, u.name, u.medical_record_number, r.id, r.room_number, r.floor, b.id, b.name;

        -- Grant permissions
        GRANT ALL ON rfid_tags TO authenticated;
        GRANT ALL ON rfid_tags TO anon;
        GRANT ALL ON rfid_tag_history TO authenticated;
        GRANT ALL ON rfid_tag_history TO anon;
        GRANT ALL ON patient_rfid_status TO authenticated;
        GRANT ALL ON patient_rfid_status TO anon;
      `
    });

    if (error) throw error;
    console.log('RFID tag schema setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up RFID tag schema:', error);
    return false;
  }
}

setupRFIDTagSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));