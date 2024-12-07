import React from 'react';

export default function LoadingPlaceholder({ type = 'card', count = 1 }) {
  const renderCardPlaceholder = () => (
    <div className="animate-pulse bg-white rounded-xl shadow-md p-4">
      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const renderTableRowPlaceholder = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>
          {type === 'card' && renderCardPlaceholder()}
          {type === 'table-row' && renderTableRowPlaceholder()}
        </div>
      ))}
    </div>
  );
}