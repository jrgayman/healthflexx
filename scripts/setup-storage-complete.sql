-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create buckets table
CREATE TABLE IF NOT EXISTS storage.buckets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create objects table
CREATE TABLE IF NOT EXISTS storage.objects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bucket_id TEXT REFERENCES storage.buckets(id),
  name TEXT NOT NULL,
  owner UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB,
  path_tokens TEXT[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
);

-- Create policies table
CREATE TABLE IF NOT EXISTS storage.policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bucket_id TEXT REFERENCES storage.buckets(id),
  definition JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (name, bucket_id)
);

-- Create user-avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'User Avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create policies for user-avatars bucket
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES 
  (
    'Avatar Upload Policy',
    'user-avatars',
    jsonb_build_object(
      'role', 'authenticated',
      'resource', 'object',
      'action', 'INSERT',
      'condition', 'true'
    )
  ),
  (
    'Avatar Public Read Policy',
    'user-avatars',
    jsonb_build_object(
      'role', 'anon',
      'resource', 'object',
      'action', 'SELECT',
      'condition', 'true'
    )
  ),
  (
    'Avatar Delete Policy',
    'user-avatars',
    jsonb_build_object(
      'role', 'authenticated',
      'resource', 'object',
      'action', 'DELETE',
      'condition', 'true'
    )
  )
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);
CREATE INDEX IF NOT EXISTS idx_storage_objects_owner ON storage.objects(owner);
CREATE INDEX IF NOT EXISTS idx_storage_policies_bucket_id ON storage.policies(bucket_id);