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

-- Add constraint to ensure either storage_path or image_url is used (not both)
ALTER TABLE posts
ADD CONSTRAINT check_image_source 
CHECK (
  (storage_path IS NULL AND image_url IS NOT NULL) OR
  (storage_path IS NOT NULL AND image_url IS NULL) OR
  (storage_path IS NULL AND image_url IS NULL)
);

-- Update existing posts to use storage path if they have an image_url
UPDATE posts
SET storage_path = SUBSTRING(image_url FROM '[^/]+$')
WHERE image_url IS NOT NULL
AND storage_path IS NULL
AND image_url LIKE '%/%';

-- Clean up any null values
UPDATE posts
SET image_url = NULL
WHERE storage_path IS NOT NULL;