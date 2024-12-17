import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}