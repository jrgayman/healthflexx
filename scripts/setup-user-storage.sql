-- Create storage buckets and policies for user avatars
DO $$
BEGIN
  -- Create the bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('user-avatars', 'User Avatars', true)
  ON CONFLICT (id) DO UPDATE
  SET public = true;

  -- Create policy to allow authenticated users to upload avatars
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Avatar Upload Policy',
    'user-avatars',
    jsonb_build_object(
      'role', 'authenticated',
      'resource', 'object',
      'action', 'INSERT',
      'condition', 'true'
    )
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Create policy to allow public read access
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
    'Avatar Public Read Policy',
    'user-avatars',
    jsonb_build_object(
      'role', 'anon',
      'resource', 'object',
      'action', 'SELECT',
      'condition', 'true'
    )
  )
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Create policy to allow users to delete their own avatars
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES (
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
END $$;