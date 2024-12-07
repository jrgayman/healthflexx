```sql
-- First ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing triggers first to avoid conflicts
DROP TRIGGER IF EXISTS update_notification_prefs_timestamp ON notification_preferences;
DROP TRIGGER IF EXISTS update_family_contacts_timestamp ON family_contacts;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notify_by_phone BOOLEAN DEFAULT false,
  notify_by_email BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
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

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_notification_prefs_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_timestamp();

CREATE TRIGGER update_family_contacts_timestamp
  BEFORE UPDATE ON family_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_timestamp();

-- Grant permissions
GRANT ALL ON notification_preferences TO authenticated;
GRANT ALL ON family_contacts TO authenticated;
```