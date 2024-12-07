import { supabase } from '../lib/supabase';

async function setupNotificationPreferences() {
  try {
    console.log('Setting up notification preferences...');

    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- First ensure we have the UUID extension
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Create notification preferences table
        CREATE TABLE IF NOT EXISTS notification_preferences (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          notify_by_phone BOOLEAN DEFAULT false,
          notify_by_email BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create family contacts table
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
        CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);
        CREATE INDEX IF NOT EXISTS idx_family_contacts_user ON family_contacts(user_id);
        CREATE INDEX IF NOT EXISTS idx_family_contacts_active ON family_contacts(active);

        -- Drop existing triggers if they exist
        DROP TRIGGER IF EXISTS update_notification_prefs_timestamp ON notification_preferences;
        DROP TRIGGER IF EXISTS update_family_contacts_timestamp ON family_contacts;

        -- Create function to update updated_at timestamp if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
            CREATE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
          END IF;
        END $$;

        -- Create triggers for updated_at
        CREATE TRIGGER update_notification_prefs_timestamp
          BEFORE UPDATE ON notification_preferences
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        CREATE TRIGGER update_family_contacts_timestamp
          BEFORE UPDATE ON family_contacts
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        -- Grant permissions
        GRANT ALL ON notification_preferences TO authenticated;
        GRANT ALL ON family_contacts TO authenticated;
      `
    });

    if (error) throw error;
    console.log('Notification preferences setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up notification preferences:', error);
    return false;
  }
}

setupNotificationPreferences()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));