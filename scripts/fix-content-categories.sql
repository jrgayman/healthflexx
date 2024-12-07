-- First, ensure we have the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add content_category_link column if it doesn't exist
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS content_category_link UUID;

-- Add foreign key constraint
ALTER TABLE posts
ADD CONSTRAINT fk_content_category_link
FOREIGN KEY (content_category_link)
REFERENCES content_categories(id)
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_content_category_link 
ON posts(content_category_link);

-- Update existing posts to link with content categories
WITH category_mapping AS (
  SELECT id, slug FROM content_categories
)
UPDATE posts p
SET content_category_link = cm.id
FROM category_mapping cm
WHERE p.content_category_link IS NULL
AND (
  (p.category = 'food-cooking' AND cm.slug = 'food-cooking') OR
  (p.category = 'fitness-exercise' AND cm.slug = 'fitness-exercise') OR
  (p.category = 'hit' AND cm.slug = 'health-imagery-training') OR
  (p.category = 'daily-insights' AND cm.slug = 'daily-insights')
);

-- Drop old category column
ALTER TABLE posts
DROP COLUMN IF EXISTS category;