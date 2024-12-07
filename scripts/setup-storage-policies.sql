-- Enable storage
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create device-images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('device-images', 'Device Images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Disable RLS on storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create public access policy
CREATE POLICY "Public Device Images Access"
ON storage.objects FOR ALL
TO public
USING (bucket_id = 'device-images');

-- Grant permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO anon;

-- Set storage limits
ALTER TABLE storage.objects
ADD CONSTRAINT max_file_size CHECK (octet_length(data) <= 5242880); -- 5MB