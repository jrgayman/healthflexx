-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- First, drop existing constraints if they exist
ALTER TABLE IF EXISTS posts
DROP CONSTRAINT IF EXISTS posts_image_id_fkey;

-- Create fresh images table
DROP TABLE IF EXISTS images CASCADE;
CREATE TABLE images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for images table
CREATE INDEX idx_images_created_at ON images(created_at);

-- Update posts table structure
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_id UUID,
ALTER COLUMN image_url DROP NOT NULL;

-- Create index for image_id
CREATE INDEX IF NOT EXISTS idx_posts_image_id ON posts(image_id);

-- Add foreign key constraint with ON DELETE SET NULL
ALTER TABLE posts
ADD CONSTRAINT posts_image_id_fkey 
FOREIGN KEY (image_id) 
REFERENCES images(id)
ON DELETE SET NULL;

-- Create function to handle image deletion
CREATE OR REPLACE FUNCTION delete_orphaned_images()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM images
  WHERE id = OLD.image_id
  AND NOT EXISTS (
    SELECT 1 FROM posts 
    WHERE image_id = OLD.image_id
    AND id != OLD.id
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean up orphaned images
DROP TRIGGER IF EXISTS cleanup_orphaned_images ON posts;
CREATE TRIGGER cleanup_orphaned_images
AFTER UPDATE OF image_id OR DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION delete_orphaned_images();