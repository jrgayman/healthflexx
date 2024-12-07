-- Create medical-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-files', 'Medical Files', false)
ON CONFLICT (id) DO UPDATE
SET public = false;

-- Create policies for medical files
INSERT INTO storage.policies (name, bucket_id, definition)
VALUES 
  (
    'Medical Files Upload',
    'medical-files',
    jsonb_build_object(
      'role', 'authenticated',
      'resource', 'object',
      'action', 'INSERT',
      'condition', 'true'
    )
  ),
  (
    'Medical Files Access',
    'medical-files',
    jsonb_build_object(
      'role', 'authenticated',
      'resource', 'object',
      'action', 'SELECT',
      'condition', 'true'
    )
  ),
  (
    'Medical Files Delete',
    'medical-files',
    jsonb_build_object(
      'role', 'authenticated',
      'resource', 'object',
      'action', 'DELETE',
      'condition', 'true'
    )
  )
ON CONFLICT (name, bucket_id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON medical_readings TO authenticated;
GRANT ALL ON reading_types TO authenticated;
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;