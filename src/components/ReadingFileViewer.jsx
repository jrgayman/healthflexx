import { useState } from 'react';
import { getMedicalFileUrl, getFileIcon, formatFileSize } from '../lib/fileUtils';

export default function ReadingFileViewer({ reading }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!reading?.file_path) return null;

  const fileUrl = getMedicalFileUrl(reading.file_path);
  const fileIcon = getFileIcon(reading.file_type);
  const fileSize = formatFileSize(reading.file_size);

  const handleView = () => {
    if (reading.file_type?.startsWith('image/')) {
      setIsOpen(true);
    } else {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <button
        onClick={handleView}
        className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark"
      >
        <span>{fileIcon}</span>
        <span className="text-sm underline">{reading.file_name}</span>
        <span className="text-xs text-gray-500">({fileSize})</span>
      </button>

      {/* Image Viewer Modal */}
      {isOpen && reading.file_type?.startsWith('image/') && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={fileUrl}
              alt={reading.file_name}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}