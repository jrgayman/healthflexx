-- Drop any existing storage-related columns
ALTER TABLE users
DROP COLUMN IF EXISTS avatar_storage_path CASCADE;

-- Ensure avatar_url column exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;