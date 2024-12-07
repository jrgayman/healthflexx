-- First, ensure we have the correct user table structure
ALTER TABLE users
DROP COLUMN IF EXISTS avatar_storage_path CASCADE,
ALTER COLUMN password_hash SET DEFAULT '$2a$10$XQtJ9.yqD7eFXDYWvj8kB.njc2FMqwcUvtXdgKRLVGTJbqOXHx3hy';

-- Ensure avatar_url exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;