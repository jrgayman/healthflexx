-- Check if buckets exist
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('user-avatars');

-- Check bucket policies
SELECT bucket_id, name, definition
FROM storage.policies
WHERE bucket_id = 'user-avatars';

-- Check if any files exist in the buckets
SELECT bucket_id, name, metadata
FROM storage.objects
WHERE bucket_id = 'user-avatars'
LIMIT 5;