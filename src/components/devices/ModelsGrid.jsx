import React from 'react';
import { handleImageError } from '../../lib/imageUtils';

export default function ModelsGrid({ models, onEdit, onAdd }) {
  if (!models?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No models found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Model
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {models.map((model) => (
          <div 
            key={model.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              {model.image_url ? (
                <img
                  src={model.image_url}
                  alt={model.name}
                  className="object-cover w-full h-48"
                  onError={(e) => handleImageError(e, 'medium')}
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-50">
                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-500 mb-2">{model.device_classifications?.name}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{model.description}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => onEdit(model)}
                  className="text-primary hover:text-primary-dark"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}