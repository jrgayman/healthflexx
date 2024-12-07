-- Check if we have any posts
SELECT COUNT(*) FROM posts;

-- Look at sample posts
SELECT id, title, slug, content_category_link, active 
FROM posts 
LIMIT 5;

-- Check content categories
SELECT * FROM content_categories;

-- Check a specific post with all its details
SELECT 
  p.*,
  cc.name as category_name,
  cc.icon as category_icon,
  cc.description as category_description
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
WHERE p.active = true
ORDER BY p.created_at DESC
LIMIT 1;