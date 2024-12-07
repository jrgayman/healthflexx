import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import FilterDropdown from '../../components/FilterDropdown';
import TypeForm from '../../components/devices/TypeForm';
import ProductForm from '../../components/devices/ProductForm';

export default function DeviceManager() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      // Fetch device classifications
      const { data: classData, error: classError } = await supabase
        .from('device_classifications')
        .select('*')
        .order('name');

      if (classError) throw classError;
      setClassifications(classData || []);

      // Fetch device types with images
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

      // Fetch products
      const { data: productData, error: productError } = await supabase
        .from('device_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (productError) throw productError;
      setProducts(productData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setModalType('classification');
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Add Category
          </button>
          <button
            onClick={() => {
              setModalType('type');
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Add Model
          </button>
          <button
            onClick={() => {
              setModalType('product');
              setSelectedItem(null);
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            Add Device
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'models'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Models
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeTab === 'categories'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Categories
        </button>
      </div>

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {deviceTypes.map((type) => (
            <div 
              key={type.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {type.image_url ? (
                  <img
                    src={type.image_url}
                    alt={type.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x300?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-2">{type.device_classifications?.name}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setModalType('type');
                      setSelectedItem(type);
                      setIsModalOpen(true);
                    }}
                    className="text-primary hover:text-primary-dark"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Form Modal */}
      {isModalOpen && modalType === 'type' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedItem ? 'Edit Model' : 'Add Model'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedItem(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <TypeForm
              type={selectedItem}
              classifications={classifications}
              onSave={async (data) => {
                try {
                  let error;
                  if (selectedItem) {
                    ({ error } = await supabase
                      .from('device_types')
                      .update(data)
                      .eq('id', selectedItem.id));
                  } else {
                    ({ error } = await supabase
                      .from('device_types')
                      .insert([data]));
                  }

                  if (error) throw error;
                  toast.success(selectedItem ? 'Model updated!' : 'Model added!');
                  setIsModalOpen(false);
                  setSelectedItem(null);
                  fetchInitialData();
                } catch (error) {
                  console.error('Error saving model:', error);
                  toast.error('Failed to save model');
                }
              }}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedItem(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Other modals */}
    </div>
  );
}