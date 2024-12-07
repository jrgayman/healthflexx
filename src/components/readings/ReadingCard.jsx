import { formatReadingValue } from '../../lib/readingUtils';
import ReadingFileViewer from '../ReadingFileViewer';

export default function ReadingCard({ reading, type }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-sm text-gray-500 mb-1">
        {new Date(reading.reading_date).toLocaleString()}
      </div>
      
      {type.value_type === 'numeric' ? (
        <div className="font-medium text-gray-900">
          {formatReadingValue(reading, type.code)}
          {type.unit && <span className="ml-1 text-gray-500">{type.unit}</span>}
        </div>
      ) : type.value_type === 'text' ? (
        <div className="text-gray-900">{reading.text_value}</div>
      ) : (
        <ReadingFileViewer reading={reading} />
      )}

      {reading.notes && (
        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
          {reading.notes}
        </div>
      )}
    </div>
  );
}