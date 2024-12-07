-- First, drop existing constraints if they exist
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_valid_type,
DROP CONSTRAINT IF EXISTS check_content_type_fields;

-- Add new columns for different content types if they don't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS app_url TEXT,
ADD COLUMN IF NOT EXISTS web_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_video_url ON posts(video_url);
CREATE INDEX IF NOT EXISTS idx_posts_app_url ON posts(app_url);
CREATE INDEX IF NOT EXISTS idx_posts_web_url ON posts(web_url);

-- Set default type for existing posts
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

-- Add constraint to ensure proper content type fields
ALTER TABLE posts
ADD CONSTRAINT check_content_type_fields
CHECK (
  (type = 'article' AND video_url IS NULL AND app_url IS NULL AND web_url IS NULL) OR
  (type = 'video' AND video_url IS NOT NULL AND app_url IS NULL AND web_url IS NULL) OR
  (type = 'app' AND app_url IS NOT NULL AND video_url IS NULL AND web_url IS NULL) OR
  (type = 'weblink' AND web_url IS NOT NULL AND video_url IS NULL AND app_url IS NULL)
);

-- Clean up any existing posts that might violate the new constraints
UPDATE posts
SET 
  video_url = NULL,
  duration = NULL,
  app_url = NULL,
  web_url = NULL
WHERE type = 'article';