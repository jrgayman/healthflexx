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

-- Update content_category_link for all posts
WITH category_mapping AS (
  SELECT id, slug FROM content_categories
)
UPDATE posts p
SET content_category_link = cm.id
FROM category_mapping cm
WHERE (
  (p.category = 'food-cooking' AND cm.slug = 'food-cooking') OR
  (p.category = 'fitness-exercise' AND cm.slug = 'fitness-exercise') OR
  (p.category = 'hit' AND cm.slug = 'health-imagery-training') OR
  (p.category = 'daily-insights' AND cm.slug = 'daily-insights')
);

-- Verify the relationships
SELECT 
  p.id,
  p.title,
  p.type,
  cc.name as category_name,
  cc.slug as category_slug
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
WHERE p.active = true;