-- Create storage buckets for user content
CREATE OR REPLACE FUNCTION create_storage_buckets()
RETURNS void AS $$
BEGIN
  -- Create user-avatars bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name)
  VALUES ('user-avatars', 'user-avatars')
  ON CONFLICT (id) DO NOTHING;

  -- Set public access for user-avatars bucket
  UPDATE storage.buckets
  SET public = true
  WHERE id = 'user-avatars';
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_storage_buckets();