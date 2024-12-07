-- Check post_likes table structure
\d post_likes;

-- Check if any records exist
SELECT COUNT(*) as total_likes FROM post_likes;

-- Sample some recent likes
SELECT 
  pl.id,
  pl.post_id,
  p.title as post_title,
  pl.created_at
FROM post_likes pl
JOIN posts p ON p.id = pl.post_id
ORDER BY pl.created_at DESC
LIMIT 5;

-- Check trigger is working by comparing counts
SELECT 
  p.id,
  p.title,
  p.likes as stored_count,
  COUNT(pl.id) as actual_count,
  CASE 
    WHEN p.likes = COUNT(pl.id) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.likes
HAVING p.likes != COUNT(pl.id)
ORDER BY p.likes DESC;