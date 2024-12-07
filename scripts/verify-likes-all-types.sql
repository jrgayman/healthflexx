-- Check if likes are working for all content types
SELECT 
  p.id,
  p.title,
  p.type,
  p.likes as total_likes,
  COUNT(pl.id) as actual_likes,
  CASE 
    WHEN p.likes = COUNT(pl.id) THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.id, p.title, p.type, p.likes
ORDER BY p.type, p.created_at DESC;

-- Check distribution of likes across content types
SELECT 
  p.type,
  COUNT(DISTINCT p.id) as total_content,
  COUNT(DISTINCT pl.id) as total_likes,
  ROUND(AVG(p.likes), 2) as avg_likes_per_content
FROM posts p
LEFT JOIN post_likes pl ON pl.post_id = p.id
GROUP BY p.type
ORDER BY total_likes DESC;

-- Verify trigger works for all content types
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgtype,
  tgenabled
FROM pg_trigger
WHERE tgrelid = 'post_likes'::regclass;

-- Check foreign key constraint is enforced for all content types
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'post_likes'
  AND tc.constraint_type = 'FOREIGN KEY';