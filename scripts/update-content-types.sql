-- Add columns for different content types
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

-- Add constraint to ensure proper content type fields
ALTER TABLE posts
ADD CONSTRAINT check_content_type_fields
CHECK (
  (type = 'article' AND video_url IS NULL AND app_url IS NULL AND web_url IS NULL) OR
  (type = 'video' AND video_url IS NOT NULL AND app_url IS NULL AND web_url IS NULL) OR
  (type = 'app' AND app_url IS NOT NULL AND video_url IS NULL AND web_url IS NULL) OR
  (type = 'weblink' AND web_url IS NOT NULL AND video_url IS NULL AND app_url IS NULL)
);