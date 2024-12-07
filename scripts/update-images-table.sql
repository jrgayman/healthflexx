-- Update images table to ensure proper storage and retrieval
ALTER TABLE images
ALTER COLUMN data TYPE TEXT,
ALTER COLUMN content_type SET NOT NULL,
ADD CONSTRAINT valid_content_type CHECK (
  content_type IN (
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/svg+xml'
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_content_type ON images(content_type);

-- Update existing records to ensure valid content types
UPDATE images 
SET content_type = 'image/jpeg' 
WHERE content_type IS NULL OR content_type NOT IN (
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml'
);