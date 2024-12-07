-- Check post_likes table structure and constraints
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  identity_generation
FROM information_schema.columns 
WHERE table_name = 'post_likes'
ORDER BY ordinal_position;

-- Check if any records exist
SELECT COUNT(*) as total_likes FROM post_likes;

-- Sample a few records if they exist
SELECT * FROM post_likes LIMIT 5;

-- Check foreign key constraint
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'post_likes'
  AND tc.constraint_type = 'FOREIGN KEY';