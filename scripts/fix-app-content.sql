-- Update any existing app content to ensure proper type and fields
UPDATE posts
SET 
  type = 'app',
  app_store_url = COALESCE(app_store_url, 'https://apps.apple.com/placeholder'),
  play_store_url = COALESCE(play_store_url, 'https://play.google.com/store/placeholder')
WHERE id = 'cb4ab61c-0f97-494d-951e-837ee4a8c105';

-- Verify the update
SELECT id, title, type, app_store_url, play_store_url, content
FROM posts
WHERE id = 'cb4ab61c-0f97-494d-951e-837ee4a8c105';