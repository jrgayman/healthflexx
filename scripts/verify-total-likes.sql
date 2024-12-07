-- Check if total_likes column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'total_likes';

-- Verify trigger is working
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'post_likes'
AND trigger_name = 'trigger_update_total_likes';

-- Check some sample data
SELECT 
  p.id,
  p.title,
  p.total_likes,
  COUNT(pl.id) as actual_likes,
  CASE 
    WHEN p.total_likes = COUNT(pl.id) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.total_likes
ORDER BY p.created_at DESC
LIMIT 5;