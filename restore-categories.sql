-- Insert or update all four content categories
INSERT INTO content_categories (name, description, icon)
VALUES 
  ('Food & Cooking', 'Discover healthy recipes and cooking tips', '🍳'),
  ('Fitness & Exercise', 'Workout routines and exercise guides', '💪'),
  ('Health Imagery Training (HIT)', 'Mental wellness and visualization techniques', '🧘'),
  ('Daily HealthFlexx Insights', 'Daily tips and health insights', '✨')
ON CONFLICT (name) 
DO UPDATE SET 
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;