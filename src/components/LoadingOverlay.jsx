import React from 'react';
import { getLoadingMessage } from '../lib/loadingUtils';

export default function LoadingOverlay({ context = 'default' }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-500">{getLoadingMessage(context)}</p>
      </div>
    </div>
  );
}