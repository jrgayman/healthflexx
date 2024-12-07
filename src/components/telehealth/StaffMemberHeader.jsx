import React from 'react';
import StaffStatusRadio from './StaffStatusRadio';
import SecondaryStatusRadio from './SecondaryStatusRadio';

export default function StaffMemberHeader({ member, onStatusChange }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img
            src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
            alt=""
            className="h-24 w-24 rounded-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
            }}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
            <div className="text-gray-600 mt-1">
              <p>Provider: The Commons on Meridian</p>
              <p>Phone: 8882439102</p>
              <p>Email: ava.smith@healthflexxinc.com</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">My Status</h3>
          <StaffStatusRadio 
            status={member.primaryStatus}
            onChange={(status) => onStatusChange({ primary: status })}
          />
          {member.primaryStatus === 'Available' && (
            <div className="mt-4">
              <SecondaryStatusRadio
                status={member.secondaryStatus}
                onChange={(status) => onStatusChange({ secondary: status })}
              />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <a
              href="https://healthflexxinc.com/mymeetings"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors text-center font-medium"
            >
              Launch My Telehealth Room
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Patients in Queue:</span>
              <span className="font-medium text-gray-900">{member.queueCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Wait Time:</span>
              <span className="font-medium text-gray-900">12 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sessions Today:</span>
              <span className="font-medium text-gray-900">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}