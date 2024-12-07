-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing constraints and tables to start fresh
ALTER TABLE IF EXISTS posts
DROP CONSTRAINT IF EXISTS posts_image_id_fkey;

DROP TABLE IF EXISTS images CASCADE;

-- Create images table with proper structure
CREATE TABLE images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_content_type CHECK (
    content_type IN (
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'image/svg+xml'
    )
  )
);

-- Create indexes for better performance
CREATE INDEX idx_images_content_type ON images(content_type);
CREATE INDEX idx_images_created_at ON images(created_at);

-- Update posts table
ALTER TABLE posts
DROP COLUMN IF EXISTS image_url,
ADD COLUMN IF NOT EXISTS image_id UUID;

-- Create index on posts.image_id
CREATE INDEX IF NOT EXISTS idx_posts_image_id ON posts(image_id);

-- Add foreign key constraint with ON DELETE SET NULL
ALTER TABLE posts
ADD CONSTRAINT posts_image_id_fkey 
  FOREIGN KEY (image_id) 
  REFERENCES images(id)
  ON DELETE SET NULL;