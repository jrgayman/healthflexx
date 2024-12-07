-- Add new columns for app store links
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS app_store_url TEXT,
ADD COLUMN IF NOT EXISTS play_store_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_app_store_url ON posts(app_store_url);
CREATE INDEX IF NOT EXISTS idx_posts_play_store_url ON posts(play_store_url);

-- Update the content type fields constraint
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_content_type_fields;

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