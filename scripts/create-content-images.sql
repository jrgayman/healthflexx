-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create content_images table
CREATE TABLE IF NOT EXISTS content_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  public_url TEXT
);

-- Create function to generate public URL
CREATE OR REPLACE FUNCTION generate_storage_url(file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Base Supabase storage URL for content-images bucket
  RETURN 'https://pmmkfrohclzpwpnbtajc.supabase.co/storage/v1/object/public/content-images/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with their public URLs
UPDATE content_images
SET public_url = generate_storage_url(storage_path)
WHERE storage_path IS NOT NULL
AND public_url IS NULL;

-- Create trigger to automatically set public_url on insert or update
CREATE OR REPLACE FUNCTION update_public_url()
RETURNS TRIGGER AS $$
BEGIN
  NEW.public_url := generate_storage_url(NEW.storage_path);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_public_url ON content_images;

-- Create trigger
CREATE TRIGGER trigger_update_public_url
BEFORE INSERT OR UPDATE OF storage_path
ON content_images
FOR EACH ROW
EXECUTE FUNCTION update_public_url();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_images_storage_path ON content_images(storage_path);
CREATE INDEX IF NOT EXISTS idx_content_images_public_url ON content_images(public_url);
CREATE INDEX IF NOT EXISTS idx_content_images_created_at ON content_images(created_at);

-- Add storage_path to posts if it doesn't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS storage_path TEXT REFERENCES content_images(storage_path);

-- Create index for posts storage_path
CREATE INDEX IF NOT EXISTS idx_posts_storage_path ON posts(storage_path);