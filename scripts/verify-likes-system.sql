-- First, get a valid post ID to check
SELECT id, title, likes 
FROM posts 
LIMIT 1;

-- Then check likes for that specific post
-- Replace the UUID below with an actual post ID from your database
SELECT COUNT(*) as total_likes
FROM post_likes
WHERE post_id = '123e4567-e89b-12d3-a456-426614174000';

-- See recent likes across all posts
SELECT 
  p.title,
  COUNT(pl.id) as like_count,
  p.likes as cached_count,
  MAX(pl.created_at) as latest_like
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.likes
HAVING COUNT(pl.id) > 0
ORDER BY latest_like DESC;

-- Verify trigger is working by checking for any mismatches
SELECT 
  p.id,
  p.title,
  p.likes as cached_count,
  COUNT(pl.id) as actual_count
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.likes
HAVING p.likes != COUNT(pl.id);