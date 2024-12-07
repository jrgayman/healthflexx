-- Create storage for user avatars
CREATE TABLE IF NOT EXISTS user_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_user_images_storage_path ON user_images(storage_path);

-- Update users table to use storage_path instead of avatar_url
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_storage_path TEXT REFERENCES user_images(storage_path) ON DELETE SET NULL;

-- Create function to handle image cleanup
CREATE OR REPLACE FUNCTION cleanup_user_image()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.avatar_storage_path IS DISTINCT FROM NEW.avatar_storage_path) OR 
     (TG_OP = 'DELETE' AND OLD.avatar_storage_path IS NOT NULL) THEN
    -- Storage cleanup handled by application
    NULL;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for image cleanup
CREATE TRIGGER trigger_cleanup_user_image
BEFORE UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION cleanup_user_image();