-- Drop existing constraints and columns
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_image_source,
DROP CONSTRAINT IF EXISTS posts_image_id_fkey;

-- Clean up old columns
ALTER TABLE posts
DROP COLUMN IF EXISTS image_id,
DROP COLUMN IF EXISTS image_url;

-- Add storage_path column if it doesn't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_storage_path ON posts(storage_path);

-- Clean up any null values
UPDATE posts
SET storage_path = NULL
WHERE storage_path = '';