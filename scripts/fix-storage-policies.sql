-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;

-- Drop existing storage policies for user-avatars
DELETE FROM storage.policies 
WHERE bucket_id = 'user-avatars';

-- Create updated policies with proper RLS
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES 
  (
    'Avatar Upload Policy',
    'user-avatars',
    jsonb_build_object(
      'role', 'anon',
      'resource', 'object',
      'action', 'INSERT',
      'definition', 'true'
    )
  ),
  (
    'Avatar Public Read Policy',
    'user-avatars',
    jsonb_build_object(
      'role', 'anon',
      'resource', 'object', 
      'action', 'SELECT',
      'definition', 'true'
    )
  ),
  (
    'Avatar Delete Policy',
    'user-avatars',
    jsonb_build_object(
      'role', 'anon',
      'resource', 'object',
      'action', 'DELETE',
      'definition', 'true'
    )
  ),
  (
    'Avatar Update Policy',
    'user-avatars', 
    jsonb_build_object(
      'role', 'anon',
      'resource', 'object',
      'action', 'UPDATE',
      'definition', 'true'
    )
  );

-- Enable RLS on the bucket if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create new RLS policy for public access
CREATE POLICY "Avatar Public Access"
ON storage.objects FOR ALL
TO anon
USING (bucket_id = 'user-avatars');