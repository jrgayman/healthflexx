import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function useDeviceData() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, typeFilter, statusFilter]);

  async function fetchInitialData() {
    try {
      setLoading(true);
      
      // Fetch classifications
      const { data: classData, error: classError } = await supabase
        .from('device_classifications')
        .select('id, name, description')
        .order('name');

      if (classError) throw classError;
      setClassifications(classData || []);

      // Fetch device types
      const { data: typeData, error: typeError } = await supabase
        .from('device_types')
        .select(`
          id,
          name,
          description,
          classification_id,
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
          id,
          device_name,
          serial_number,
          mac_address,
          notes,
          active,
          device_type_id,
          user_id,
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
      toast.error('Failed to load device data');
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

  return {
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
  };
}