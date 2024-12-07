-- First, ensure content_categories has proper slugs
UPDATE content_categories
SET slug = CASE 
  WHEN name = 'Food & Cooking' THEN 'food-cooking'
  WHEN name = 'Fitness & Exercise' THEN 'fitness-exercise'
  WHEN name = 'Health Imagery Training (HIT)' THEN 'health-imagery-training'
  WHEN name = 'Daily HealthFlexx Insights' THEN 'daily-insights'
  ELSE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', ''), '\s+', '-', 'g'))
END
WHERE slug IS NULL OR slug = '';

-- Get the Food & Cooking category ID
WITH food_category AS (
  SELECT id FROM content_categories WHERE slug = 'food-cooking' LIMIT 1
)
-- Update the specific post to link with Food & Cooking category
UPDATE posts
SET content_category_link = (SELECT id FROM food_category)
WHERE id = 'cb4ab61c-0f97-494d-951e-837ee4a8c105';

-- Verify the post's category link
SELECT 
  p.id,
  p.title,
  p.type,
  cc.name as category_name,
  cc.slug as category_slug,
  p.content_category_link,
  p.app_store_url,
  p.play_store_url,
  p.content
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
WHERE p.id = 'cb4ab61c-0f97-494d-951e-837ee4a8c105';