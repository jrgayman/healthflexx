-- Add storage_path column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_storage_path ON posts(storage_path);

-- Update existing posts to use storage path if they have an image_id
UPDATE posts p
SET storage_path = i.name
FROM images i
WHERE p.image_id = i.id
AND p.storage_path IS NULL;

-- Add constraint to ensure either storage_path or image_url is used (not both)
ALTER TABLE posts
ADD CONSTRAINT check_image_source 
CHECK (
  (storage_path IS NULL AND image_url IS NOT NULL) OR
  (storage_path IS NOT NULL AND image_url IS NULL) OR
  (storage_path IS NULL AND image_url IS NULL)
);