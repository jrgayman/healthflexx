-- First, ensure we have UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add avatar columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_storage_path ON users(avatar_storage_path);

-- Create storage bucket reference table
CREATE TABLE IF NOT EXISTS user_storage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for storage paths
CREATE INDEX IF NOT EXISTS idx_user_storage_path ON user_storage(storage_path);

-- Add foreign key constraint
ALTER TABLE users
ADD CONSTRAINT fk_user_avatar_storage
FOREIGN KEY (avatar_storage_path)
REFERENCES user_storage(storage_path)
ON DELETE SET NULL;

-- Create cleanup function for old images
CREATE OR REPLACE FUNCTION cleanup_user_avatar()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.avatar_storage_path IS DISTINCT FROM NEW.avatar_storage_path) OR 
     (TG_OP = 'DELETE' AND OLD.avatar_storage_path IS NOT NULL) THEN
    DELETE FROM user_storage 
    WHERE storage_path = OLD.avatar_storage_path
    AND NOT EXISTS (
      SELECT 1 FROM users 
      WHERE avatar_storage_path = OLD.avatar_storage_path 
      AND id != OLD.id
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cleanup
DROP TRIGGER IF EXISTS trigger_cleanup_user_avatar ON users;
CREATE TRIGGER trigger_cleanup_user_avatar
BEFORE UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION cleanup_user_avatar();