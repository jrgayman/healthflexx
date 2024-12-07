-- Check post_likes table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'post_likes'
ORDER BY ordinal_position;

-- Check posts table likes column
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND column_name = 'likes';

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('posts', 'post_likes')
  AND indexname IN ('idx_post_likes_post_id', 'idx_posts_likes');

-- Check trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'post_likes'
  AND trigger_name = 'trigger_update_post_likes_count';

-- Test data integrity
SELECT 
  p.id,
  p.title,
  p.likes,
  COUNT(pl.id) as like_count,
  CASE 
    WHEN p.likes = COUNT(pl.id) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.likes
ORDER BY p.created_at DESC
LIMIT 10;