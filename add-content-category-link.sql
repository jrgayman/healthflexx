-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add content_category_link column to posts table
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

-- Update existing posts to link with content categories based on the name field
UPDATE posts p
SET content_category_link = cc.id
FROM content_categories cc
WHERE p.content_category_link IS NULL
AND cc.name IN (
  'Food & Cooking',
  'Fitness & Exercise',
  'Health Imagery Training (HIT)',
  'Daily HealthFlexx Insights'
);