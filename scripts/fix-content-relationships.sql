-- First, verify and fix content categories
UPDATE content_categories
SET slug = CASE 
  WHEN name = 'Food & Cooking' THEN 'food-cooking'
  WHEN name = 'Fitness & Exercise' THEN 'fitness-exercise'
  WHEN name = 'Health Imagery Training (HIT)' THEN 'health-imagery-training'
  WHEN name = 'Daily HealthFlexx Insights' THEN 'daily-insights'
  ELSE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', ''), '\s+', '-', 'g'))
END
WHERE slug IS NULL OR slug = '';

-- Ensure app content is properly configured
UPDATE posts
SET 
  type = 'app',
  app_store_url = COALESCE(app_store_url, 'https://apps.apple.com/app/healthflexx'),
  play_store_url = COALESCE(play_store_url, 'https://play.google.com/store/apps/details?id=com.healthflexx')
WHERE id = 'cb4ab61c-0f97-494d-951e-837ee4a8c105';

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