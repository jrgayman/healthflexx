-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing constraints to start fresh
ALTER TABLE IF EXISTS posts
DROP CONSTRAINT IF EXISTS posts_image_id_fkey,
DROP CONSTRAINT IF EXISTS check_image_source;

-- Add storage_path column to posts table if it doesn't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_storage_path ON posts(storage_path);

-- Add constraint to ensure proper image storage
ALTER TABLE posts
ADD CONSTRAINT check_image_source 
CHECK (
  (storage_path IS NULL AND image_id IS NOT NULL) OR
  (storage_path IS NOT NULL AND image_id IS NULL) OR
  (storage_path IS NULL AND image_id IS NULL)
);

-- Update existing posts to use storage path if they have an image_id
UPDATE posts p
SET storage_path = i.name
FROM images i
WHERE p.image_id = i.id
AND p.storage_path IS NULL;

-- Clean up any null values
UPDATE posts
SET image_id = NULL
WHERE storage_path IS NOT NULL;

-- Create function to handle image cleanup
CREATE OR REPLACE FUNCTION cleanup_unused_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old image if it exists and is not used by other posts
  IF OLD.image_id IS NOT NULL AND 
     OLD.image_id != COALESCE(NEW.image_id, OLD.image_id) THEN
    DELETE FROM images
    WHERE id = OLD.image_id
    AND NOT EXISTS (
      SELECT 1 FROM posts 
      WHERE image_id = OLD.image_id 
      AND id != OLD.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for image cleanup
DROP TRIGGER IF EXISTS trigger_cleanup_unused_images ON posts;
CREATE TRIGGER trigger_cleanup_unused_images
AFTER UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION cleanup_unused_images();