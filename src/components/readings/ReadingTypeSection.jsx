import { useState, useEffect } from 'react';
import ReadingTypeHeader from './ReadingTypeHeader';
import ReadingCard from './ReadingCard';
import ReadingsChart from './ReadingsChart';
import BloodPressureChart from './BloodPressureChart';

export default function ReadingTypeSection({ type, readings }) {
  const [viewMode, setViewMode] = useState('cards');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (readings.length > 0) {
      if (type.value_type === 'numeric') {
        const values = readings.map(r => r.numeric_value).filter(Boolean);
        setStats({
          latest: values[0],
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          count: values.length
        });
      } else if (type.value_type === 'blood_pressure') {
        const systolicValues = readings.map(r => r.systolic_value).filter(Boolean);
        const diastolicValues = readings.map(r => r.diastolic_value).filter(Boolean);
        setStats({
          latest: `${systolicValues[0]}/${diastolicValues[0]}`,
          min: `${Math.min(...systolicValues)}/${Math.min(...diastolicValues)}`,
          max: `${Math.max(...systolicValues)}/${Math.max(...diastolicValues)}`,
          avg: `${(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length).toFixed(0)}/${(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length).toFixed(0)}`,
          count: systolicValues.length
        });
      }
    }
  }, [readings, type]);

  if (readings.length === 0) return null;

  const renderStats = () => (
    <div className="grid grid-cols-5 gap-2 mb-4 text-sm">
      <div className="bg-gray-50 p-2 rounded">
        <div className="text-gray-500">Latest</div>
        <div className="font-medium">{stats.latest} {type.unit}</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <div className="text-gray-500">Min</div>
        <div className="font-medium">{stats.min} {type.unit}</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <div className="text-gray-500">Max</div>
        <div className="font-medium">{stats.max} {type.unit}</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <div className="text-gray-500">Avg</div>
        <div className="font-medium">{stats.avg} {type.unit}</div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <div className="text-gray-500">Total</div>
        <div className="font-medium">{stats.count}</div>
      </div>
    </div>
  );

  // Determine if this is a file-based reading type
  const isFileType = ['image', 'audio', 'pdf', 'media', 'text'].includes(type.value_type);

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${isFileType ? 'col-span-1' : 'col-span-full'}`}>
      <div className="flex justify-between items-center mb-4">
        <ReadingTypeHeader icon={type.icon} name={type.name} />
        {(type.value_type === 'numeric' || type.value_type === 'blood_pressure') && (
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="cards">Show as Cards</option>
            <option value="chart">Show by Chart</option>
          </select>
        )}
      </div>

      {stats && renderStats()}

      {viewMode === 'chart' ? (
        <div className="mt-4">
          {type.value_type === 'blood_pressure' ? (
            <BloodPressureChart readings={readings} />
          ) : (
            <ReadingsChart readings={readings} readingType={type} />
          )}
        </div>
      ) : (
        <div 
          className="space-y-4 overflow-y-auto custom-scrollbar" 
          style={{ maxHeight: '400px' }}
          onWheel={(e) => e.stopPropagation()}
        >
          {readings.map(reading => (
            <ReadingCard 
              key={reading.id} 
              reading={reading} 
              type={type}
            />
          ))}
        </div>
      )}
    </div>
  );
}