import React from 'react';

export default function CategoriesGrid({ categories, onEdit }) {
  if (!categories?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No categories found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category) => (
        <div 
          key={category.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            <div className="flex justify-end">
              <button
                onClick={() => onEdit(category)}
                className="text-primary hover:text-primary-dark"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}