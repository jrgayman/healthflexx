import { supabase } from './supabase';

export async function uploadMedicalFile(file, patientId, readingType) {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${patientId}/${readingType}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('medical-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export function getMedicalFileUrl(filePath) {
  if (!filePath) return null;
  return supabase.storage.from('medical-files').getPublicUrl(filePath).data.publicUrl;
}

export function getFileIcon(fileType) {
  if (!fileType) return '📄';
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🔊';
  if (fileType === 'application/pdf') return '📑';
  return '📄';
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}