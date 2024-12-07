import { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ImageUpload({ onImageUploaded, currentImageUrl = null }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      toast.success('Avatar updated');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {currentImageUrl && (
        <img
          src={currentImageUrl}
          alt="Avatar"
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
          }}
        />
      )}
      
      <div className="flex-1">
        <label className="block">
          <span className="sr-only">Choose avatar</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary-dark
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </label>
        <p className="mt-1 text-xs text-gray-500">PNG, JPG or GIF (max. 2MB)</p>
      </div>
    </div>
  );
}