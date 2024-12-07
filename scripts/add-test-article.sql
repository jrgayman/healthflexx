-- Insert a test article into the posts table
INSERT INTO posts (
  title,
  slug,
  content,
  excerpt,
  content_category_link,
  active,
  featured,
  likes
) VALUES (
  'The Cow Went to the Moon',
  'cow-moon-adventure',
  'The cow went to the moon. It was a remarkable journey that no cow had ever taken before.',
  'A whimsical tale of a bovine space adventure',
  (SELECT id FROM content_categories WHERE name = 'Daily HealthFlexx Insights' LIMIT 1),
  true,
  false,
  0
);