import React from 'react';
import FilterDropdown from './FilterDropdown';

export default function ReadingFilters({ 
  readingTypeFilter, 
  onReadingTypeChange,
  dateFilter,
  onDateChange,
  readingTypes 
}) {
  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <FilterDropdown
        label="Reading Type"
        value={readingTypeFilter}
        onChange={onReadingTypeChange}
        options={[
          { value: '', label: 'All Types' },
          ...readingTypes.map(type => ({
            value: type.id,
            label: `${type.icon} ${type.name}`
          }))
        ]}
      />
      <FilterDropdown
        label="Time Period"
        value={dateFilter}
        onChange={onDateChange}
        options={dateOptions}
      />
    </div>
  );
}