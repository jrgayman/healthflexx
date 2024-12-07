-- Check users table avatar columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users'
AND column_name IN ('avatar_storage_path', 'avatar_url');

-- Check user_storage table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_storage';

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'user_storage')
AND indexname IN ('idx_users_avatar_storage_path', 'idx_user_storage_path');

-- Check foreign key constraint
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'users'
AND tc.constraint_type = 'FOREIGN KEY';