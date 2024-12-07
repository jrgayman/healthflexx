import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryGrid({ categories, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-6">
            <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!categories?.length) {
    return (
      <p className="text-center text-gray-500">No categories available.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {categories.map((category) => (
        <Link
          key={category.slug}
          to={`/blog/${category.slug}`}
          className="group bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center mb-4">
            <span className="text-3xl bg-primary/10 p-3 rounded-xl group-hover:bg-primary/20 transition-colors">
              {category.icon}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500">
            {category.description}
          </p>
        </Link>
      ))}
    </div>
  );
}