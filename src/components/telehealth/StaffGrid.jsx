import React from 'react';
import StaffCard from './StaffCard';

export default function StaffGrid({ staff, onStatusChange }) {
  if (!staff?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No staff members found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {staff.map((member) => (
        <StaffCard
          key={member.id}
          member={member}
          onStatusChange={() => onStatusChange(member.id)}
        />
      ))}
    </div>
  );
}