-- Create a fresh images table with proper structure
DROP TABLE IF EXISTS images CASCADE;

CREATE TABLE images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  content_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_content_type CHECK (
    content_type IN (
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'image/svg+xml'
    )
  )
);

-- Create indexes for better performance
CREATE INDEX idx_images_content_type ON images(content_type);

-- Update posts table to reference images
ALTER TABLE posts
DROP CONSTRAINT IF EXISTS posts_image_id_fkey,
ADD CONSTRAINT posts_image_id_fkey 
  FOREIGN KEY (image_id) 
  REFERENCES images(id)
  ON DELETE SET NULL;