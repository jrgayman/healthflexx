import React from 'react';

export default function ContentTypeIcon({ type, showText = true, className = "h-5 w-5" }) {
  const getTypeDetails = () => {
    switch (type) {
      case 'video':
        return {
          icon: (
            <svg className={className} viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          ),
          text: 'Watch'
        };
      case 'app':
        return {
          icon: (
            <svg className={className} viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"/>
              <path d="M10 4a1 1 0 100 2 1 1 0 000-2z"/>
            </svg>
          ),
          text: 'Get App'
        };
      case 'weblink':
        return {
          icon: (
            <svg className={className} viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          ),
          text: 'Visit'
        };
      default:
        return {
          icon: (
            <svg className={className} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          ),
          text: 'Read'
        };
    }
  };

  const { icon, text } = getTypeDetails();

  return (
    <div className="inline-flex items-center gap-1">
      {icon}
      {showText && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}