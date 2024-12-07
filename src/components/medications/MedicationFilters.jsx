import React from 'react';
import SearchBar from '../SearchBar';
import FilterDropdown from '../FilterDropdown';

export default function MedicationFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  classFilter,
  onClassChange,
  pharmClasses = []
}) {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <SearchBar 
        onSearch={onSearchChange} 
        placeholder="Search medications..."
      />
      <FilterDropdown
        label="Status"
        value={statusFilter}
        onChange={onStatusChange}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'all', label: 'All' }
        ]}
      />
      <FilterDropdown
        label="Pharmaceutical Class"
        value={classFilter}
        onChange={onClassChange}
        options={pharmClasses.map(c => ({
          value: c,
          label: c
        }))}
      />
    </div>
  );
}