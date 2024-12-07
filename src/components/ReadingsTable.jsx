import { formatReadingValue } from '../lib/readingUtils';
import ReadingFileViewer from './ReadingFileViewer';

export default function ReadingsTable({ readings }) {
  if (!readings?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No readings found for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(reading.reading_date).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{reading.reading_types.icon}</span>
                  <span className="text-sm text-gray-900">{reading.reading_types.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {reading.reading_types.value_type === 'numeric' ? (
                  <span className="text-sm text-gray-900">
                    {formatReadingValue(reading, reading.reading_types.code)}
                  </span>
                ) : (
                  <ReadingFileViewer reading={reading} />
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {reading.text_value || reading.notes || '-'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}