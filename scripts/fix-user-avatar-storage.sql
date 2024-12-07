-- First ensure we have the storage schema
CREATE SCHEMA IF NOT EXISTS storage;

-- Create buckets table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.buckets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  public BOOLEAN DEFAULT FALSE
);

-- Create objects table if it doesn't exist
CREATE TABLE IF NOT EXISTS storage.objects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id TEXT NOT NULL,
  name TEXT NOT NULL,
  owner UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);

-- Ensure user-avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'User Avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a simple public access policy
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
CREATE POLICY "Public Avatar Access"
ON storage.objects FOR ALL
TO PUBLIC
USING (bucket_id = 'user-avatars');