-- Add content_category_link column to posts table if it doesn't exist
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
WITH category_links AS (
  SELECT 
    id,
    name
  FROM content_categories
)
UPDATE posts
SET content_category_link = cl.id
FROM category_links cl
WHERE content_category_link IS NULL
AND cl.name IN (
  'Food & Cooking',
  'Fitness & Exercise',
  'Health Imagery Training (HIT)',
  'Daily HealthFlexx Insights'
);