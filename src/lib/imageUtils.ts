import { supabase } from './supabase';

export const getImageUrl = (storagePath: string | null): string | null => {
  if (!storagePath) {
    console.log('No storage path provided');
    return null;
  }

  try {
    const { data, error } = supabase.storage
      .from('content-images')
      .getPublicUrl(storagePath);

    if (error) {
      console.error('Error generating image URL:', error);
      throw error;
    }

    if (!data?.publicUrl) {
      console.warn('No public URL returned for storage path:', storagePath);
      return null;
    }

    console.log('Generated image URL:', data.publicUrl);
    return data.publicUrl;
  } catch (err) {
    console.error('Error generating image URL:', err);
    return null;
  }
};

export const handleImageError = (e: Event, size: 'small' | 'medium' | 'large' = 'medium'): void => {
  if (!(e.target instanceof HTMLImageElement)) return;

  e.target.onerror = null; // Prevent infinite loop
  
  const sizes = {
    small: '100x100',
    medium: '600x400',
    large: '1200x400'
  };

  e.target.src = `https://placehold.co/${sizes[size]}?text=Image+Not+Available`;
  
  // Add opacity class based on parent container classes
  if (e.target.parentElement?.classList.contains('h-48')) {
    e.target.className = 'w-full h-48 object-cover opacity-75';
  } else if (e.target.parentElement?.classList.contains('h-10')) {
    e.target.className = 'h-10 w-10 rounded object-cover opacity-75';
  } else {
    e.target.className = 'w-full h-full object-cover opacity-75';
  }
};