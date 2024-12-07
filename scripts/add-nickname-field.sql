-- Add nickname column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- Update existing users with default nicknames based on their names
UPDATE users
SET nickname = SPLIT_PART(name, ' ', 1)
WHERE nickname IS NULL;