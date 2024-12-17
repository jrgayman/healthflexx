import React from 'react';
import { COMMON_TIMEZONES } from '../../constants/timezones';

export default function TimezoneSelect({ value, onChange }) {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
      >
        {COMMON_TIMEZONES.map(tz => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
}