-- Check posts table likes column
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'likes';

-- Check post_likes table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'post_likes';

-- Sample some posts with their like counts
SELECT 
  p.id,
  p.title,
  p.likes,
  COUNT(pl.id) as like_count
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.likes
ORDER BY p.created_at DESC
LIMIT 5;