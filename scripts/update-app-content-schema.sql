-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add new columns for app store links if they don't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS app_store_url TEXT,
ADD COLUMN IF NOT EXISTS play_store_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_app_store_url ON posts(app_store_url);
CREATE INDEX IF NOT EXISTS idx_posts_play_store_url ON posts(play_store_url);

-- Drop existing type constraint if it exists
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_valid_type;

-- Ensure type column exists and is properly configured
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'type'
  ) THEN
    ALTER TABLE posts ADD COLUMN type TEXT DEFAULT 'article';
  END IF;
END $$;

-- Update any null types to 'article'
UPDATE posts 
SET type = 'article' 
WHERE type IS NULL;

-- Make type column required
ALTER TABLE posts 
ALTER COLUMN type SET NOT NULL;

-- Add constraint to validate content type
ALTER TABLE posts
ADD CONSTRAINT check_valid_type
CHECK (type IN ('article', 'video', 'app', 'weblink'));

-- Drop existing content type fields constraint if it exists
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_content_type_fields;

-- Add updated constraint to ensure proper content type fields
ALTER TABLE posts
ADD CONSTRAINT check_content_type_fields
CHECK (
  (type = 'article' AND video_url IS NULL AND app_store_url IS NULL AND play_store_url IS NULL AND web_url IS NULL) OR
  (type = 'video' AND video_url IS NOT NULL AND app_store_url IS NULL AND play_store_url IS NULL AND web_url IS NULL) OR
  (type = 'app' AND app_store_url IS NOT NULL AND play_store_url IS NOT NULL AND video_url IS NULL AND web_url IS NULL) OR
  (type = 'weblink' AND web_url IS NOT NULL AND video_url IS NULL AND app_store_url IS NULL AND play_store_url IS NULL)
);

-- Clean up any existing posts that might violate the new constraints
UPDATE posts
SET 
  app_store_url = NULL,
  play_store_url = NULL
WHERE type != 'app';

-- Create function to validate content type fields
CREATE OR REPLACE FUNCTION validate_content_type_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Clear fields not relevant to the content type
  CASE NEW.type
    WHEN 'article' THEN
      NEW.video_url := NULL;
      NEW.app_store_url := NULL;
      NEW.play_store_url := NULL;
      NEW.web_url := NULL;
    WHEN 'video' THEN
      NEW.app_store_url := NULL;
      NEW.play_store_url := NULL;
      NEW.web_url := NULL;
    WHEN 'app' THEN
      NEW.video_url := NULL;
      NEW.web_url := NULL;
    WHEN 'weblink' THEN
      NEW.video_url := NULL;
      NEW.app_store_url := NULL;
      NEW.play_store_url := NULL;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically clean up fields
DROP TRIGGER IF EXISTS trigger_validate_content_type ON posts;
CREATE TRIGGER trigger_validate_content_type
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION validate_content_type_fields();

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('type', 'app_store_url', 'play_store_url')
ORDER BY ordinal_position;