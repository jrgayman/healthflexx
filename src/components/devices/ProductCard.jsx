```jsx
import React from 'react';
import { handleImageError } from '../../lib/imageUtils';

export default function ProductCard({ device, onEdit }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9 bg-gray-100">
        {device.image_url ? (
          <img
            src={device.image_url}
            alt={device.device_name}
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
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">{device.classification}</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            device.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {device.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{device.device_name}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          {device.serial_number && (
            <div className="flex justify-between">
              <span className="text-gray-500">Serial:</span>
              <span className="font-medium">{device.serial_number}</span>
            </div>
          )}
          {device.mac_address && (
            <div className="flex justify-between">
              <span className="text-gray-500">MAC:</span>
              <span className="font-mono text-xs">{device.mac_address}</span>
            </div>
          )}
          {device.manufacturer && (
            <div className="flex justify-between">
              <span className="text-gray-500">Manufacturer:</span>
              <span>{device.manufacturer}</span>
            </div>
          )}
        </div>
        {device.user_name && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Assigned to:</span>
              <span className="text-sm font-medium text-gray-900">{device.user_name}</span>
            </div>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onEdit(device)}
            className="text-primary hover:text-primary-dark"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
```