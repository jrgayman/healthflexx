import React from 'react';
import SearchBar from '../SearchBar';
import FilterDropdown from '../FilterDropdown';

export default function StaffFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange
}) {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <SearchBar 
        onSearch={onSearchChange} 
        placeholder="Search staff members..."
      />
      <FilterDropdown
        label="Role"
        value={roleFilter}
        onChange={onRoleChange}
        options={[
          { value: '', label: 'All Roles' },
          { value: 'Telehealth Operations Manager', label: 'Operations Manager' },
          { value: 'Virtual Care Coordinator', label: 'Care Coordinator' },
          { value: 'Telehealth Technical Support', label: 'Technical Support' }
        ]}
      />
      <FilterDropdown
        label="Status"
        value={statusFilter}
        onChange={onStatusChange}
        options={[
          { value: '', label: 'All Statuses' },
          { value: 'Available', label: 'Available' },
          { value: 'Off Duty', label: 'Off Duty' }
        ]}
      />
    </div>
  );
}