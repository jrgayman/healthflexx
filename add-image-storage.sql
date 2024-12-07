-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create images table for storing uploaded images
CREATE TABLE IF NOT EXISTS images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add image_id to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_id UUID REFERENCES images(id);

-- Create index on image_id
CREATE INDEX IF NOT EXISTS idx_posts_image_id ON posts(image_id);

-- Keep image_url for backward compatibility
-- but make it nullable if it isn't already
ALTER TABLE posts
ALTER COLUMN image_url DROP NOT NULL;