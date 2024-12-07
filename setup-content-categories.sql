-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create content_categories table
CREATE TABLE IF NOT EXISTS content_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_category_name UNIQUE (name)
);

-- Insert the categories
INSERT INTO content_categories (name, description, icon) 
VALUES 
  ('Food & Cooking', 'Recipes, cooking tips, and nutritional guidance', '🍳'),
  ('Fitness & Exercise', 'Workout routines and physical fitness guides', '💪'),
  ('Health Imagery Training (HIT)', 'Mental wellness and visualization techniques', '🧘'),
  ('Daily HealthFlexx Insights', 'Daily health tips and wellness insights', '✨')
ON CONFLICT (name) 
DO UPDATE SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;

-- Add category_id to posts table and link to content_categories
ALTER TABLE posts 
DROP COLUMN IF EXISTS category,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES content_categories(id);

-- Create index on category_id
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id);

-- Update existing posts to link to appropriate categories based on content_categories.name
WITH category_mapping AS (
  SELECT id, name FROM content_categories
)
UPDATE posts p
SET category_id = cm.id
FROM category_mapping cm
WHERE p.category_id IS NULL
AND CASE 
  WHEN p.category = 'food-cooking' THEN cm.name = 'Food & Cooking'
  WHEN p.category = 'fitness-exercise' THEN cm.name = 'Fitness & Exercise'
  WHEN p.category = 'hit' THEN cm.name = 'Health Imagery Training (HIT)'
  WHEN p.category = 'daily-insights' THEN cm.name = 'Daily HealthFlexx Insights'
END;