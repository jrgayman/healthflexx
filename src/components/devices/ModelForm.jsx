import React, { useState } from 'react';
import { uploadDeviceImage, deleteDeviceImage } from '../../lib/deviceStorage';
import toast from 'react-hot-toast';

export default function ModelForm({ model = null, classifications, onSave, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(model?.image_url);
  const [imageFile, setImageFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      let imageUrl = model?.image_url;

      // Handle image upload/update
      if (imageFile) {
        // Delete old image if exists
        if (model?.image_url) {
          await deleteDeviceImage(model.image_url);
        }
        // Upload new image
        imageUrl = await uploadDeviceImage(imageFile);
      }

      const modelData = {
        classification_id: formData.get('classification_id'),
        name: formData.get('name'),
        description: formData.get('description'),
        image_url: imageUrl
      };

      await onSave(modelData);
      toast.success(model ? 'Model updated!' : 'Model added!');
      onClose();
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error(error.message || 'Failed to save model');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Model Image</label>
        <div className="mt-2 flex flex-col items-center">
          {imagePreview && (
            <div className="relative mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x300?text=No+Image';
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-gray-300 cursor-pointer hover:bg-gray-50">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="mt-2 text-sm text-gray-600">Upload image</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF or WebP up to 5MB</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="classification_id"
          defaultValue={model?.classification_id || ''}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Select Category</option>
          {classifications.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Model Name</label>
        <input
          type="text"
          name="name"
          defaultValue={model?.name}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          defaultValue={model?.description}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (model ? 'Update' : 'Add')}
        </button>
      </div>
    </form>
  );
}