import React from 'react';
import StaffStatusBadge from './StaffStatusBadge';

export default function StaffCard({ member, onStatusChange }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            className="h-12 w-12 rounded-full"
            src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
            alt=""
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
            }}
          />
          <div className="ml-4">
            <h3 className="font-medium text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        </div>
        <StaffStatusBadge
          primaryStatus={member.primaryStatus}
          secondaryStatus={member.secondaryStatus}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Location:</span>
          <span className="font-medium">{member.location}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Queue:</span>
          <span className="font-medium">{member.queueCount} patients</span>
        </div>

        <div className="flex justify-between items-center">
          <a
            href={member.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark"
          >
            Join Meeting Room
          </a>
          <button
            onClick={onStatusChange}
            className="text-primary hover:text-primary-dark"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}