import { supabase } from '../lib/supabase';

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Execute SQL commands
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add wearable device fields to activity_goals table
        ALTER TABLE activity_goals
        ADD COLUMN IF NOT EXISTS mac_address TEXT,
        ADD COLUMN IF NOT EXISTS battery_level INTEGER DEFAULT 0;

        -- Create index for MAC address
        CREATE INDEX IF NOT EXISTS idx_activity_goals_mac_address ON activity_goals(mac_address);

        -- Add constraint for battery level range
        ALTER TABLE activity_goals
        ADD CONSTRAINT check_battery_level
        CHECK (battery_level >= 0 AND battery_level <= 100);

        -- Create family_contacts table if it doesn't exist
        CREATE TABLE IF NOT EXISTS family_contacts (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          notify_by_phone BOOLEAN DEFAULT false,
          notify_by_email BOOLEAN DEFAULT false,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_family_contacts_user ON family_contacts(user_id);
        CREATE INDEX IF NOT EXISTS idx_family_contacts_active ON family_contacts(active);
      `
    });

    if (error) throw error;
    console.log('Database setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));