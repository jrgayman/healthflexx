```jsx
import React from 'react';

export default function ProductTable({ products, onEdit }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((device) => (
              <tr key={device.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{device.device_name}</div>
                  <div className="text-sm text-gray-500">{device.device_type}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{device.classification}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{device.serial_number || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-mono">{device.mac_address || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{device.user_name || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    device.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {device.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEdit(device)}
                    className="text-primary hover:text-primary-dark"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```