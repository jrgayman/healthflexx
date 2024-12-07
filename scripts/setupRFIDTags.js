import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pmmkfrohclzpwpnbtajc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbWtmcm9oY2x6cHdwbmJ0YWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4MTM4MDYsImV4cCI6MjA0NjM4OTgwNn0.2m8L21ploy11YBpO3Wf0Qv7uZ243oIqA2PP9DuaR0As';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRFIDTags() {
  try {
    console.log('Setting up RFID tags schema...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create RFID tags table
        CREATE TABLE IF NOT EXISTS rfid_tags (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          tag_id TEXT NOT NULL UNIQUE,
          user_id UUID REFERENCES users(id),
          room_id UUID REFERENCES rooms(id),
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
        CREATE INDEX IF NOT EXISTS idx_rfid_tags_room ON rfid_tags(room_id);
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

        -- Create view for RFID tag history
        CREATE OR REPLACE VIEW rfid_tag_history AS
        SELECT 
          rt.id,
          rt.tag_id,
          rt.status,
          rt.last_changed,
          rt.last_scanned,
          rt.active,
          u.name as patient_name,
          u.medical_record_number,
          r.room_number,
          r.floor,
          b.name as building_name,
          rt.created_at,
          rt.updated_at
        FROM rfid_tags rt
        LEFT JOIN users u ON rt.user_id = u.id
        LEFT JOIN rooms r ON rt.room_id = r.id
        LEFT JOIN buildings b ON r.building_id = b.id
        ORDER BY rt.created_at DESC;

        -- Grant permissions
        GRANT ALL ON rfid_tags TO authenticated;
        GRANT ALL ON rfid_tags TO anon;
        GRANT ALL ON rfid_tag_history TO authenticated;
        GRANT ALL ON rfid_tag_history TO anon;
      `
    });

    if (error) throw error;
    console.log('RFID tags schema setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up RFID tags schema:', error);
    return false;
  }
}

setupRFIDTags()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));