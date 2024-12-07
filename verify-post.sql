-- Check posts and their categories
SELECT 
  p.id,
  p.title,
  p.slug,
  p.content,
  cc.name as category_name,
  cc.icon as category_icon
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
WHERE p.active = true
ORDER BY p.created_at DESC
LIMIT 1;