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