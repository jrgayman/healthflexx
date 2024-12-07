import React from 'react';
import StaffFilters from './StaffFilters';

export default function StaffHeader({ filters, onFilterChange }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Telehealth Clinic Staff</h1>
      </div>

      <StaffFilters
        searchTerm={filters.search}
        onSearchChange={(value) => onFilterChange('search', value)}
        roleFilter={filters.role}
        onRoleFilter={(value) => onFilterChange('role', value)}
        statusFilter={filters.status}
        onStatusFilter={(value) => onFilterChange('status', value)}
      />
    </div>
  );
}