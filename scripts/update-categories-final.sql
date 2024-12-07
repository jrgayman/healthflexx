-- Update category names and slugs to be consistent
UPDATE content_categories
SET 
  name = CASE 
    WHEN name = 'Food & Cooking' THEN 'Food and Cooking'
    WHEN name = 'Fitness & Exercise' THEN 'Fitness and Exercise'
    WHEN name = 'Health Imagery Training (HIT)' THEN 'Health Imagery Training'
    WHEN name = 'Daily HealthFlexx Insights' THEN 'Daily Insights'
    ELSE name
  END,
  slug = CASE
    WHEN name = 'Food & Cooking' THEN 'food-and-cooking'
    WHEN name = 'Fitness & Exercise' THEN 'fitness-and-exercise'
    WHEN name = 'Health Imagery Training (HIT)' THEN 'health-imagery-training'
    WHEN name = 'Daily HealthFlexx Insights' THEN 'daily-insights'
    ELSE LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', ''), '\s+', '-', 'g'))
  END,
  description = CASE
    WHEN description LIKE '%&%' THEN REPLACE(description, '&', 'and')
    ELSE description
  END;