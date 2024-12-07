import React from 'react';

export default function StaffStatusBadge({ primaryStatus, secondaryStatus }) {
  const getPrimaryStatusColor = () => {
    switch (primaryStatus) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Off Duty':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSecondaryStatusColor = () => {
    switch (secondaryStatus) {
      case 'Available not w/ Patient':
        return 'bg-blue-100 text-blue-800';
      case 'Available w/ Patient':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-1">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrimaryStatusColor()}`}>
        {primaryStatus}
      </span>
      {secondaryStatus && (
        <div className="px-2 py-1 text-xs font-medium rounded-full text-center">
          <span className={getSecondaryStatusColor()}>
            {secondaryStatus}
          </span>
        </div>
      )}
    </div>
  );
}