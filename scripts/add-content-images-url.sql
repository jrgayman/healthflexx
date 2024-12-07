-- Add public_url column to content-images table
ALTER TABLE content_images
ADD COLUMN IF NOT EXISTS public_url TEXT;

-- Create function to generate public URL
CREATE OR REPLACE FUNCTION generate_storage_url(file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Base Supabase storage URL for content-images bucket
  RETURN 'https://pmmkfrohclzpwpnbtajc.supabase.co/storage/v1/object/public/content-images/' || file_path;
END;
$$ LANGUAGE plpgsql;

-- Update existing records with their public URLs
UPDATE content_images
SET public_url = generate_storage_url(storage_path)
WHERE storage_path IS NOT NULL
AND public_url IS NULL;

-- Create trigger to automatically set public_url on insert or update
CREATE OR REPLACE FUNCTION update_public_url()
RETURNS TRIGGER AS $$
BEGIN
  NEW.public_url := generate_storage_url(NEW.storage_path);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_public_url ON content_images;

-- Create trigger
CREATE TRIGGER trigger_update_public_url
BEFORE INSERT OR UPDATE OF storage_path
ON content_images
FOR EACH ROW
EXECUTE FUNCTION update_public_url();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_content_images_public_url ON content_images(public_url);