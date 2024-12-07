-- Check post_likes table structure
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'post_likes'
);

-- Check posts table likes column
SELECT EXISTS (
   SELECT FROM information_schema.columns 
   WHERE table_name = 'posts' 
   AND column_name = 'likes'
);

-- Check trigger exists
SELECT EXISTS (
   SELECT FROM pg_trigger 
   WHERE tgname = 'trigger_update_post_likes_count'
);

-- Sample some data
SELECT 
  p.id,
  p.title,
  p.type,
  p.likes as stored_likes,
  COUNT(pl.id) as actual_likes,
  CASE 
    WHEN p.likes = COUNT(pl.id) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.type, p.likes
ORDER BY p.created_at DESC
LIMIT 5;