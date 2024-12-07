-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing constraints to start fresh
ALTER TABLE IF EXISTS posts
DROP CONSTRAINT IF EXISTS posts_image_id_fkey;

-- Ensure images table exists with correct structure
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_content_type ON images(content_type);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);

-- Ensure posts table has image_id column
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_id UUID;

-- Create index on posts.image_id
CREATE INDEX IF NOT EXISTS idx_posts_image_id ON posts(image_id);

-- Add foreign key constraint with ON DELETE SET NULL
ALTER TABLE posts
ADD CONSTRAINT posts_image_id_fkey 
  FOREIGN KEY (image_id) 
  REFERENCES images(id)
  ON DELETE SET NULL;

-- Clean up any orphaned images
DELETE FROM images 
WHERE id NOT IN (
  SELECT image_id 
  FROM posts 
  WHERE image_id IS NOT NULL
);

-- Create function to handle image deletion
CREATE OR REPLACE FUNCTION delete_orphaned_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Only delete the image if it's not referenced by any other posts
  IF OLD.image_id IS NOT NULL THEN
    DELETE FROM images
    WHERE id = OLD.image_id
    AND NOT EXISTS (
      SELECT 1 FROM posts 
      WHERE image_id = OLD.image_id 
      AND id != OLD.id
    );
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean up orphaned images
DROP TRIGGER IF EXISTS cleanup_orphaned_images ON posts;
CREATE TRIGGER cleanup_orphaned_images
AFTER UPDATE OF image_id OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION delete_orphaned_images();