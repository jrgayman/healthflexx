import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import CategoryForm from '../../../components/devices/CategoryForm';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('device_classifications')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (data) => {
    try {
      const { error } = await supabase
        .from('device_classifications')
        .upsert([{
          ...data,
          id: selectedCategory?.id
        }]);

      if (error) throw error;
      toast.success(selectedCategory ? 'Category updated!' : 'Category added!');
      setIsModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  setIsModalOpen(true);
                }}
                className="text-primary hover:text-primary-dark"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <CategoryForm
          category={selectedCategory}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}