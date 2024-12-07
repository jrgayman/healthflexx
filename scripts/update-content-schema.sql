-- Add embed_code column to posts table if it doesn't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS embed_code TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_embed_code ON posts(embed_code);

-- Drop existing type constraint
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_valid_type;

-- Add updated type constraint
ALTER TABLE posts
ADD CONSTRAINT check_valid_type
CHECK (type IN ('article', 'video', 'video-embed', 'app', 'weblink'));

-- Drop existing content type fields constraint
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_content_type_fields;

-- Add updated constraint to handle embedded videos
ALTER TABLE posts
ADD CONSTRAINT check_content_type_fields
CHECK (
  (type = 'article' AND video_url IS NULL AND embed_code IS NULL AND app_store_url IS NULL AND play_store_url IS NULL AND web_url IS NULL) OR
  (type = 'video' AND video_url IS NOT NULL AND embed_code IS NULL AND app_store_url IS NULL AND play_store_url IS NULL AND web_url IS NULL) OR
  (type = 'video-embed' AND embed_code IS NOT NULL AND video_url IS NULL AND app_store_url IS NULL AND play_store_url IS NULL AND web_url IS NULL) OR
  (type = 'app' AND app_store_url IS NOT NULL AND play_store_url IS NOT NULL AND video_url IS NULL AND embed_code IS NULL AND web_url IS NULL) OR
  (type = 'weblink' AND web_url IS NOT NULL AND video_url IS NULL AND embed_code IS NULL AND app_store_url IS NULL AND play_store_url IS NULL)
);