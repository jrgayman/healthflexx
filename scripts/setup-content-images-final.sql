-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create content_images table
CREATE TABLE IF NOT EXISTS content_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  public_url TEXT GENERATED ALWAYS AS (
    'https://pmmkfrohclzpwpnbtajc.supabase.co/storage/v1/object/public/content-images/' || storage_path
  ) STORED
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_content_images_storage_path ON content_images(storage_path);
CREATE INDEX IF NOT EXISTS idx_content_images_public_url ON content_images(public_url);
CREATE INDEX IF NOT EXISTS idx_content_images_created_at ON content_images(created_at);

-- Update posts table to reference content_images
ALTER TABLE posts
DROP COLUMN IF EXISTS image_url,
DROP COLUMN IF EXISTS image_id,
ADD COLUMN IF NOT EXISTS storage_path TEXT REFERENCES content_images(storage_path) ON DELETE SET NULL;

-- Create index for posts storage_path
CREATE INDEX IF NOT EXISTS idx_posts_storage_path ON posts(storage_path);

-- Clean up any orphaned content_images
DELETE FROM content_images
WHERE storage_path NOT IN (
  SELECT storage_path 
  FROM posts 
  WHERE storage_path IS NOT NULL
);