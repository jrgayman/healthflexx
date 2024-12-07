-- Check table structure
\d posts;
\d content_categories;

-- Check sample data
SELECT 
  p.id,
  p.title,
  p.slug,
  p.content,
  p.storage_path,
  cc.name as category_name,
  cc.icon as category_icon
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
WHERE p.active = true
LIMIT 1;

-- Check specific post by slug
SELECT 
  p.id,
  p.title,
  p.slug,
  p.content,
  p.storage_path,
  cc.name as category_name,
  cc.icon as category_icon
FROM posts p
LEFT JOIN content_categories cc ON p.content_category_link = cc.id
WHERE p.slug = 'top-10-low-sugar-fruits-for-healthier-diet'
AND p.active = true;