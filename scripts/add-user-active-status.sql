-- Add active column to users table if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Set all existing users to active
UPDATE users SET active = true WHERE active IS NULL;