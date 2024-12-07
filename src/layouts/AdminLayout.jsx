import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from '../components/admin/AdminNav';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function AdminLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="py-6">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  );
}