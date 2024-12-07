-- Create devices reference table
CREATE TABLE IF NOT EXISTS devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert device types
INSERT INTO devices (name) VALUES
  ('6-in-1'),
  ('Health Scale'),
  ('Health Band'),
  ('Glucose Monitor'),
  ('Blood Pressure')
ON CONFLICT (name) DO NOTHING;

-- Create user_devices junction table
CREATE TABLE IF NOT EXISTS user_devices (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, device_id)
);

-- Add organization column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization);