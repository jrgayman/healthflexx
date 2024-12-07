-- Create device-images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('device-images', 'Device Images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create storage policy for public access
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Public Device Images Access',
  'device-images',
  jsonb_build_object(
    'role', 'anon',
    'resource', 'object',
    'action', 'ALL',
    'definition', 'true'
  )
)
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO anon;