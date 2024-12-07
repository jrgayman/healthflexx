import { useState, useEffect } from 'react';
import ReadingTypeSection from './ReadingTypeSection';

export default function ReadingsGrid({ readings, readingTypes }) {
  const [groupedReadings, setGroupedReadings] = useState({});

  useEffect(() => {
    // Group readings by type
    const grouped = readingTypes.reduce((acc, type) => {
      acc[type.code] = readings.filter(r => r.reading_types?.code === type.code);
      return acc;
    }, {});
    setGroupedReadings(grouped);
  }, [readings, readingTypes]);

  // Separate numeric/BP readings from file-based readings
  const numericTypes = readingTypes.filter(type => 
    type.value_type === 'numeric' || type.value_type === 'blood_pressure'
  );
  const fileTypes = readingTypes.filter(type => 
    ['image', 'audio', 'pdf', 'media', 'text'].includes(type.value_type)
  );

  return (
    <div className="space-y-6">
      {/* Numeric/BP readings */}
      <div className="space-y-6">
        {numericTypes.map(type => (
          <ReadingTypeSection
            key={type.code}
            type={type}
            readings={groupedReadings[type.code] || []}
          />
        ))}
      </div>

      {/* File-based readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fileTypes.map(type => (
          <ReadingTypeSection
            key={type.code}
            type={type}
            readings={groupedReadings[type.code] || []}
          />
        ))}
      </div>
    </div>
  );
}