import React, { useState } from 'react';

export default function TypeForm({ type = null, classifications, onSave, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      const data = {
        classification_id: formData.get('classification_id'),
        name: formData.get('name'),
        description: formData.get('description')
      };

      if (type?.id) {
        data.id = type.id;
      }

      await onSave(data);
    } catch (error) {
      console.error('Error in type form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {type ? 'Edit Model' : 'Add Model'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="classification_id"
              defaultValue={type?.classification_id || ''}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">Select Category</option>
              {classifications.map(classification => (
                <option key={classification.id} value={classification.id}>
                  {classification.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Model Name</label>
            <input
              type="text"
              name="name"
              defaultValue={type?.name}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              defaultValue={type?.description}
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
              {isSubmitting ? 'Saving...' : (type ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}