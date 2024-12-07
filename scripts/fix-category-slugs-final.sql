-- First, remove any existing constraints and triggers
ALTER TABLE content_categories
DROP CONSTRAINT IF EXISTS valid_slug_format;
DROP TRIGGER IF EXISTS trigger_generate_category_slug ON content_categories;

-- Add slug column if it doesn't exist
ALTER TABLE content_categories
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Drop existing index to avoid conflicts
DROP INDEX IF EXISTS idx_content_categories_slug;

-- Clean and update existing slugs
UPDATE content_categories
SET slug = CASE 
  WHEN name = 'Food & Cooking' THEN 'food-cooking'
  WHEN name = 'Fitness & Exercise' THEN 'fitness-exercise'
  WHEN name = 'Health Imagery Training (HIT)' THEN 'health-imagery-training'
  WHEN name = 'Daily HealthFlexx Insights' THEN 'daily-insights'
  ELSE LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          name, 
          '[^a-zA-Z0-9\s-]', 
          ''
        ),
        '\s+',
        '-',
        'g'
      ),
      '-+',
      '-',
      'g'
    )
  )
END;

-- Create unique index
CREATE UNIQUE INDEX idx_content_categories_slug ON content_categories(slug);

-- Make slug column required
ALTER TABLE content_categories
ALTER COLUMN slug SET NOT NULL;

-- Add constraint for new slugs
ALTER TABLE content_categories
ADD CONSTRAINT valid_slug_format
CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Create function to generate clean slugs
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a clean slug from the name
  NEW.slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          NEW.name,
          '[^a-zA-Z0-9\s-]',
          ''
        ),
        '\s+',
        '-',
        'g'
      ),
      '-+',
      '-',
      'g'
    )
  );
  
  -- Remove any leading or trailing hyphens
  NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new/updated categories
CREATE TRIGGER trigger_generate_category_slug
BEFORE INSERT OR UPDATE OF name ON content_categories
FOR EACH ROW
EXECUTE FUNCTION generate_category_slug();

-- Verify the results
SELECT name, slug FROM content_categories ORDER BY name;