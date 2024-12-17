import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import SearchBar from '../../../components/SearchBar';
import FilterDropdown from '../../../components/FilterDropdown';
import ProductsGrid from '../../../components/devices/ProductsGrid';
import ProductForm from '../../../components/devices/ProductForm';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, typeFilter, statusFilter]);

  async function fetchData() {
    try {
      // Fetch device types
      const { data: typeData, error: typeError } = await supabase
        .from('device_types')
        .select(`
          *,
          device_classifications (
            id,
            name
          )
        `)
        .order('name');

      if (typeError) throw typeError;
      setDeviceTypes(typeData || []);

      // Fetch devices
      const { data: deviceData, error: deviceError } = await supabase
        .from('devices')
        .select(`
          *,
          device_types (
            id,
            name,
            device_classifications (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (deviceError) throw deviceError;
      setProducts(deviceData || []);
      setFilteredProducts(deviceData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  }

  function filterProducts() {
    let filtered = [...products];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.device_name?.toLowerCase().includes(search) ||
        product.serial_number?.toLowerCase().includes(search) ||
        product.mac_address?.toLowerCase().includes(search)
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(product => product.device_type_id === typeFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(product => 
        statusFilter === 'active' ? product.active : !product.active
      );
    }

    setFilteredProducts(filtered);
  }

  const handleSave = async (data) => {
    try {
      const { error } = await supabase
        .from('devices')
        .upsert([data]);

      if (error) throw error;
      toast.success(selectedProduct ? 'Device updated!' : 'Device added!');
      setIsModalOpen(false);
      setSelectedProduct(null);
      fetchData();
    } catch (error) {
      console.error('Error saving device:', error);
      toast.error('Failed to save device');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 mr-4">
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
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark whitespace-nowrap"
        >
          Add Device
        </button>
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
          setSelectedProduct(device);
          setIsModalOpen(true);
        }}
      />

      {isModalOpen && (
        <ProductForm
          product={selectedProduct}
          deviceTypes={deviceTypes}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}