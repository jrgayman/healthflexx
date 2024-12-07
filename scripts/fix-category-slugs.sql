-- First, remove any existing constraint and trigger
ALTER TABLE content_categories
DROP CONSTRAINT IF EXISTS valid_slug_format;
DROP TRIGGER IF EXISTS trigger_generate_category_slug ON content_categories;

-- Add slug column if it doesn't exist
ALTER TABLE content_categories
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug
DROP INDEX IF EXISTS idx_content_categories_slug;
CREATE UNIQUE INDEX idx_content_categories_slug ON content_categories(slug);

-- Update existing categories with clean slugs
UPDATE content_categories
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', ''), -- Remove special chars except spaces and hyphens
      '\s+', '-', 'g'                              -- Replace spaces with single hyphens
    ),
    '-+', '-', 'g'                                 -- Replace multiple hyphens with single hyphen
  )
);

-- Make slug column required
ALTER TABLE content_categories
ALTER COLUMN slug SET NOT NULL;

-- Add constraint to ensure slug format
ALTER TABLE content_categories
ADD CONSTRAINT valid_slug_format
CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

-- Create function to generate clean slugs
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s-]', ''),
          '\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slugs
CREATE TRIGGER trigger_generate_category_slug
BEFORE INSERT OR UPDATE OF name ON content_categories
FOR EACH ROW
EXECUTE FUNCTION generate_category_slug();

-- Verify the slugs
SELECT name, slug FROM content_categories ORDER BY name;