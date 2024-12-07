import { supabase } from './supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export async function uploadDeviceImage(file) {
  if (!file) return null;

  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image must be less than 5MB');
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
    }

    // Create bucket if it doesn't exist
    const { error: bucketError } = await supabase.storage.createBucket('device-images', {
      public: true,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
      fileSizeLimit: MAX_FILE_SIZE
    });

    // Ignore error if bucket already exists
    if (bucketError && !bucketError.message.includes('already exists')) {
      throw bucketError;
    }

    // Create unique filename with original extension
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;

    // Upload to device-images bucket
    const { error: uploadError } = await supabase.storage
      .from('device-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('device-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading device image:', error);
    throw error;
  }
}

export async function deleteDeviceImage(url) {
  if (!url) return;

  try {
    // Extract filename from URL
    const fileName = url.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage
      .from('device-images')
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting device image:', error);
    throw error;
  }
}