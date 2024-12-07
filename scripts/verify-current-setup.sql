-- Check current structure
SELECT 
  p.id,
  p.title,
  p.likes,
  COUNT(pl.id) as actual_like_count,
  CASE 
    WHEN p.likes = COUNT(pl.id) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.likes
ORDER BY p.created_at DESC
LIMIT 5;

-- Check trigger is properly set up
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'post_likes'
  AND trigger_name = 'trigger_update_post_likes_count';