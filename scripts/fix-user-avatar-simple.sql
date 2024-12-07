-- Drop any existing storage-related columns and constraints
ALTER TABLE users
DROP COLUMN IF EXISTS avatar_storage_path CASCADE,
DROP COLUMN IF EXISTS avatar_url CASCADE;

-- Add simple avatar_url column
ALTER TABLE users
ADD COLUMN avatar_url TEXT;