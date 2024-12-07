-- Simplify users table to just use avatar_url
ALTER TABLE users
DROP COLUMN IF EXISTS avatar_storage_path,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;