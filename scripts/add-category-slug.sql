-- Add slug column to content_categories if it doesn't exist
ALTER TABLE content_categories
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);

-- Update existing categories with slugs
UPDATE content_categories
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Make slug column required
ALTER TABLE content_categories
ALTER COLUMN slug SET NOT NULL;

-- Add constraint to ensure slug format
ALTER TABLE content_categories
ADD CONSTRAINT valid_slug_format
CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Create function to automatically generate slug from name
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slug
DROP TRIGGER IF EXISTS trigger_generate_category_slug ON content_categories;
CREATE TRIGGER trigger_generate_category_slug
BEFORE INSERT OR UPDATE OF name ON content_categories
FOR EACH ROW
EXECUTE FUNCTION generate_category_slug();