```jsx
import React from 'react';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage,
  startIndex
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
        <span className="font-medium">{endIndex}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${
              currentPage === page
                ? 'bg-primary text-white'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
```