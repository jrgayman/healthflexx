import { supabase } from './supabase';

export const getImageUrl = (path) => {
  if (!path) return null;

  if (path.startsWith('http')) {
    return path;
  }

  const { data } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(path);

  return data?.publicUrl || null;
};

export const handleImageError = (e, size = 'medium') => {
  e.target.onerror = null;
  
  const sizes = {
    small: '100x100',
    medium: '600x400',
    large: '1200x400'
  };

  e.target.src = `https://placehold.co/${sizes[size]}?text=Image+Not+Available`;
  e.target.className = `w-full h-${size === 'small' ? '10' : '48'} object-cover opacity-75`;
};