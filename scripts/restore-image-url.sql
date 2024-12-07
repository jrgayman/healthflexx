-- Add image_url column back to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_image_url ON posts(image_url);

-- Drop existing constraint if it exists
ALTER TABLE posts 
DROP CONSTRAINT IF EXISTS check_image_source;

-- Add constraint to ensure either storage_path or image_url is used (not both)
ALTER TABLE posts
ADD CONSTRAINT check_image_source 
CHECK (
  (storage_path IS NULL AND image_url IS NOT NULL) OR
  (storage_path IS NOT NULL AND image_url IS NULL) OR
  (storage_path IS NULL AND image_url IS NULL)
);