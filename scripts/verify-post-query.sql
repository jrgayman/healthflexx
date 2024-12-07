-- Check if posts table exists and its structure
\d posts;

-- Check if content_categories table exists and its structure
\d content_categories;

-- Get a sample post to verify data
SELECT 
  p.*,
  cc.name as category_name,
  cc.icon as category_icon
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
LIMIT 1;

-- Check for any posts that might have invalid category links
SELECT p.id, p.title, p.content_category_link
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
WHERE cc.id IS NULL;