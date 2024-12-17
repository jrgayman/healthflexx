jsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import ProductsGrid from '../../components/devices/ProductsGrid';
import CategoriesGrid from '../../components/devices/CategoriesGrid';
import ModelsGrid from '../../components/devices/ModelsGrid';
import TypeForm from '../../components/devices/TypeForm';
import ProductForm from '../../components/devices/ProductForm';
import CategoryForm from '../../components/devices/CategoryForm';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import DeviceManagerTabs from '../../components/devices/DeviceManagerTabs';
import DeviceManagerHeader from '../../components/devices/DeviceManagerHeader';
import useDeviceData from '../../hooks/useDeviceData';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DeviceManager() {
  const [activeTab, setActiveTab] = useState('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
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

  const handleSave = async (data) => {
    try {
      let error;
      if (modalType === 'type') {
        ({ error } = await supabase
          .from('device_types')
          .upsert([data]));
      } else if (modalType === 'category') {
        ({ error } = await supabase
          .from('device_classifications')
          .upsert([data]));
      } else if (modalType === 'product') {
        ({ error } = await supabase
          .from('devices')
          .upsert([data]));
      }

      if (error) throw error;
      
      toast.success(
        `${modalType === 'type' ? 'Model' : modalType === 'category' ? 'Category' : 'Device'} saved successfully`
      );
      setIsModalOpen(false);
      setSelectedItem(null);
      fetchInitialData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading devices..." />;
  }

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
                <option value="cards">Card View</option>
              </select>
            </div>

            <ProductsGrid 
              products={filteredProducts}
              viewMode={viewMode}
              onEdit={(device) => {
                setModalType('product');
                setSelectedItem(device);
                setIsModalOpen(true);
              }}
            />
          </div>
        );

      case 'models':
        return (
          <ModelsGrid 
            models={deviceTypes}
            onEdit={(model) => {
              setModalType('type');
              setSelectedItem(model);
              setIsModalOpen(true);
            }}
            onAdd={() => {
              setModalType('type');
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
          />
        );

      case 'categories':
        return (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setModalType('category');
                  setSelectedItem(null);
                  setIsModalOpen(true);
                }}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
              >
                Add Category
              </button>
            </div>
            <CategoriesGrid 
              categories={classifications}
              onEdit={(category) => {
                setModalType('category');
                setSelectedItem(category);
                setIsModalOpen(true);
              }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DeviceManagerHeader 
        onAddModel={() => {
          setModalType('type');
          setSelectedItem(null);
          setIsModalOpen(true);
        }}
        onAddDevice={() => {
          setModalType('product');
          setSelectedItem(null);
          setIsModalOpen(true);
        }}
      />

      <DeviceManagerTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {renderContent()}

      {isModalOpen && (
        <>
          {modalType === 'type' && (
            <TypeForm
              type={selectedItem}
              classifications={classifications}
              onSave={handleSave}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedItem(null);
              }}
            />
          )}
          {modalType === 'product' && (
            <ProductForm
              product={selectedItem}
              deviceTypes={deviceTypes}
              onSave={handleSave}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedItem(null);
              }}
            />
          )}
          {modalType === 'category' && (
            <CategoryForm
              category={selectedItem}
              onSave={handleSave}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedItem(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}