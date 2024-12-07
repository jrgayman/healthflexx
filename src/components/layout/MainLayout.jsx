import React from 'react';
import TopNavigation from './TopNavigation';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <TopNavigation />
      <main>{children}</main>
    </div>
  );
}