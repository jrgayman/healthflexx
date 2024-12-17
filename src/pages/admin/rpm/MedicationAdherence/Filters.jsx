import React from 'react';
import SearchBar from '../../../../components/SearchBar';
import FilterDropdown from '../../../../components/FilterDropdown';

export default function Filters({ filters, onFilterChange }) {
  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
      <SearchBar 
        onSearch={(value) => onFilterChange('search', value)} 
        placeholder="Search patients..."
      />
      <FilterDropdown
        label="Status"
        value={filters.status}
        onChange={(value) => onFilterChange('status', value)}
        options={[
          { value: 'all', label: 'All Patients' },
          { value: 'active', label: 'Active Sessions' },
          { value: 'high', label: 'High Adherence (≥80%)' },
          { value: 'low', label: 'Low Adherence (<80%)' }
        ]}
      />
    </div>
  );
}