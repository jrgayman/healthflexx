-- Check if storage schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'storage';

-- Check buckets table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'storage' 
  AND table_name = 'buckets'
);

-- Check objects table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'storage' 
  AND table_name = 'objects'
);

-- Check policies table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'storage' 
  AND table_name = 'policies'
);

-- Check if user-avatars bucket exists
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'user-avatars';

-- Check bucket policies
SELECT name, bucket_id, definition
FROM storage.policies
WHERE bucket_id = 'user-avatars';