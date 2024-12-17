import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductsGrid from '../../components/devices/ProductsGrid';
import ModelsGrid from '../../components/devices/ModelsGrid';
import CategoryManager from './devices/CategoryManager';
import useDeviceData from '../../hooks/useDeviceData';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Devices() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('products');
  const [viewMode, setViewMode] = useState('grid');

  const {
    products,
    filteredProducts,
    classifications,
    deviceTypes,
    loading,
    searchTerm,
    typeFilter,
    statusFilter,
    setSearchTerm,
    setTypeFilter,
    setStatusFilter,
    fetchInitialData
  } = useDeviceData();

  const tabs = [
    { id: 'products', label: 'Products' },
    { id: 'models', label: 'Models' },
    { id: 'categories', label: 'Categories' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SearchBar 
                onSearch={setSearchTerm} 
                placeholder="Search devices..."
              />
              <FilterDropdown
                label="Device Type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={deviceTypes.map(type => ({
                  value: type.id,
                  label: type.name
                }))}
              />
              <FilterDropdown
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} devices
              </div>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="grid">Grid View</option>
                <option value="table">Table View</option>
              </select>
            </div>

            <ProductsGrid 
              products={filteredProducts}
              viewMode={viewMode}
              onEdit={(device) => {
                // Handle edit
              }}
            />
          </div>
        );

      case 'models':
        return (
          <ModelsGrid 
            models={deviceTypes}
            onEdit={(model) => {
              // Handle edit
            }}
            onAdd={() => {
              // Handle add
            }}
          />
        );

      case 'categories':
        return (
          <CategoryManager />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading devices..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  );
}