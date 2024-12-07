-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'User Avatars', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create simple storage policy for public access
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES (
  'Avatar Public Policy',
  'user-avatars',
  jsonb_build_object(
    'role', 'anon',
    'resource', 'object',
    'action', 'ALL',
    'definition', 'true'
  )
)
ON CONFLICT (name, bucket_id) DO NOTHING;