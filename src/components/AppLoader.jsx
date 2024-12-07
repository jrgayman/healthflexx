import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

export default function AppLoader({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    // Store timer reference
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <ErrorBoundary>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#78B6BA',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#fff',
            },
          },
        }}
      />
    </ErrorBoundary>
  );
}