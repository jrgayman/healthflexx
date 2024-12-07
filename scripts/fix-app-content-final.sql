-- First, ensure we have the proper schema
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS app_store_url TEXT,
ADD COLUMN IF NOT EXISTS play_store_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_app_store_url ON posts(app_store_url);
CREATE INDEX IF NOT EXISTS idx_posts_play_store_url ON posts(play_store_url);

-- Update the specific app content
UPDATE posts
SET 
  type = 'app',
  app_store_url = 'https://apps.apple.com/app/healthflexx',
  play_store_url = 'https://play.google.com/store/apps/details?id=com.healthflexx',
  content = '# HealthFlexx Mobile App

Experience the power of HealthFlexx on your mobile device! Our comprehensive health and wellness app brings all the features you love right to your fingertips.

## Key Features

- Personalized workout plans
- Nutrition tracking and meal planning
- Health metrics monitoring
- Guided meditation sessions
- Progress tracking and analytics
- Community support and sharing

Download now and start your wellness journey with HealthFlexx!'
WHERE id = 'cb4ab61c-0f97-494d-951e-837ee4a8c105';

-- Verify the update
SELECT id, title, type, app_store_url, play_store_url, content
FROM posts
WHERE id = 'cb4ab61c-0f97-494d-951e-837ee4a8c105';