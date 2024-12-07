-- Check table structures
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'post_likes';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'likes';

-- Check some sample data
SELECT 
  p.id,
  p.title,
  p.likes,
  COUNT(pl.id) as like_count
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.likes
LIMIT 5;