-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, drop all dependent triggers
DROP TRIGGER IF EXISTS trigger_cleanup_unused_images ON posts;
DROP TRIGGER IF EXISTS cleanup_orphaned_images ON posts;
DROP TRIGGER IF EXISTS trigger_cleanup_post_image ON posts;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS cleanup_unused_images() CASCADE;
DROP FUNCTION IF EXISTS delete_orphaned_images() CASCADE;
DROP FUNCTION IF EXISTS cleanup_post_image() CASCADE;

-- Drop existing constraints
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_image_source,
DROP CONSTRAINT IF EXISTS posts_image_id_fkey,
DROP CONSTRAINT IF EXISTS posts_storage_path_fkey,
DROP CONSTRAINT IF EXISTS check_valid_type;

-- Now we can safely drop the columns
ALTER TABLE posts
DROP COLUMN IF EXISTS image_id,
DROP COLUMN IF EXISTS image_url;

-- Ensure storage_path column exists with proper type
ALTER TABLE posts
DROP COLUMN IF EXISTS storage_path CASCADE;

ALTER TABLE posts
ADD COLUMN storage_path TEXT;

-- Create index for better query performance
DROP INDEX IF EXISTS idx_posts_storage_path;
CREATE INDEX idx_posts_storage_path ON posts(storage_path);

-- Add type column if it doesn't exist and set default value
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'type'
  ) THEN
    ALTER TABLE posts ADD COLUMN type TEXT;
  END IF;
END $$;

-- Update any null types to 'article'
UPDATE posts 
SET type = 'article' 
WHERE type IS NULL;

-- Make type column required
ALTER TABLE posts 
ALTER COLUMN type SET NOT NULL;

-- Add check constraint for valid types
ALTER TABLE posts
ADD CONSTRAINT check_valid_type
CHECK (type IN ('article', 'video', 'app', 'weblink'));

-- Clean up any null or empty storage paths
UPDATE posts
SET storage_path = NULL
WHERE storage_path = '' OR storage_path IS NULL;

-- Create new function to handle image deletion from storage
CREATE OR REPLACE FUNCTION cleanup_post_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If storage_path is being changed or deleted
  IF (TG_OP = 'UPDATE' AND OLD.storage_path IS DISTINCT FROM NEW.storage_path) OR 
     (TG_OP = 'DELETE' AND OLD.storage_path IS NOT NULL) THEN
    -- Storage cleanup is handled by the application layer
    NULL;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for image cleanup
CREATE TRIGGER trigger_cleanup_post_image
BEFORE UPDATE OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION cleanup_post_image();

-- Drop the old images table if it exists
DROP TABLE IF EXISTS images CASCADE;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('storage_path', 'type')
ORDER BY ordinal_position;