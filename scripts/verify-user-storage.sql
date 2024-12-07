-- Check if bucket exists and is public
SELECT id, name, public, owner
FROM storage.buckets
WHERE id = 'user-avatars';

-- Check policies
SELECT name, bucket_id, definition
FROM storage.policies
WHERE bucket_id = 'user-avatars';

-- Check existing objects (if any)
SELECT name, owner, bucket_id, created_at
FROM storage.objects
WHERE bucket_id = 'user-avatars'
ORDER BY created_at DESC
LIMIT 5;