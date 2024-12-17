import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DeviceManagerHeader from '../../../components/devices/DeviceManagerHeader';
import DeviceManagerTabs from '../../../components/devices/DeviceManagerTabs';
import ProductManager from './ProductManager';
import ModelManager from './ModelManager';
import CategoryManager from './CategoryManager';

export default function DeviceManager() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DeviceManagerHeader />
      <DeviceManagerTabs />
      
      <Routes>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<ProductManager />} />
        <Route path="models" element={<ModelManager />} />
        <Route path="categories" element={<CategoryManager />} />
      </Routes>
    </div>
  );
}