-- Check bucket exists and is public
SELECT id, name, public
FROM storage.buckets
WHERE id = 'user-avatars';

-- Check policies
SELECT name, definition
FROM storage.policies
WHERE bucket_id = 'user-avatars';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage'
AND tablename = 'objects';

-- Check RLS policies
SELECT polname, polcmd, polroles::regrole[]
FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass;