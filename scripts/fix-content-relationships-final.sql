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

-- Get the category IDs
WITH category_ids AS (
  SELECT 
    id,
    CASE 
      WHEN slug = 'food-cooking' THEN 1
      WHEN slug = 'fitness-exercise' THEN 2
      WHEN slug = 'health-imagery-training' THEN 3
      WHEN slug = 'daily-insights' THEN 4
    END as category_order
  FROM content_categories
  WHERE slug IN ('food-cooking', 'fitness-exercise', 'health-imagery-training', 'daily-insights')
)
-- Update posts without a category link to use the first category
UPDATE posts p
SET content_category_link = (
  SELECT id 
  FROM category_ids 
  ORDER BY category_order 
  LIMIT 1
)
WHERE content_category_link IS NULL;

-- Verify the relationships
SELECT 
  p.id,
  p.title,
  p.type,
  cc.name as category_name,
  cc.slug as category_slug,
  p.content_category_link
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
WHERE p.active = true;