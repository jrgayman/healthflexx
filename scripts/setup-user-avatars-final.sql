-- First ensure we have the storage schema
CREATE SCHEMA IF NOT EXISTS storage;

-- Create buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  public BOOLEAN DEFAULT FALSE
);

-- Create user-avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'User Avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Add avatar columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_storage_path ON users(avatar_storage_path);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create simple public access policy
CREATE POLICY "Public Avatar Access"
ON storage.objects FOR ALL
TO anon
USING (bucket_id = 'user-avatars');