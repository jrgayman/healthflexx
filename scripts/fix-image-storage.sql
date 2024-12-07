-- Drop existing constraints to start fresh
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS check_image_source,
DROP CONSTRAINT IF EXISTS posts_image_id_fkey;

-- Remove old image columns
ALTER TABLE posts
DROP COLUMN IF EXISTS image_id,
DROP COLUMN IF EXISTS image_url;

-- Ensure storage_path column exists
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_storage_path ON posts(storage_path);

-- Clean up any null values
UPDATE posts
SET storage_path = NULL
WHERE storage_path = '';