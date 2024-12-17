import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import TypeForm from '../../../components/devices/TypeForm';
import ModelsGrid from '../../../components/devices/ModelsGrid';

export default function ModelManager() {
  const [models, setModels] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch device classifications
      const { data: classData, error: classError } = await supabase
        .from('device_classifications')
        .select('*')
        .order('name');

      if (classError) throw classError;
      setClassifications(classData || []);

      // Fetch device types (models)
      const { data: modelData, error: modelError } = await supabase
        .from('device_types')
        .select(`
          *,
          device_classifications (
            id,
            name
          )
        `)
        .order('name');

      if (modelError) throw modelError;
      setModels(modelData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (data) => {
    try {
      const { error } = await supabase
        .from('device_types')
        .upsert([data]);

      if (error) throw error;
      toast.success(selectedModel ? 'Model updated!' : 'Model added!');
      setIsModalOpen(false);
      setSelectedModel(null);
      fetchData();
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('Failed to save model');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading models...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setSelectedModel(null);
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add Model
        </button>
      </div>

      <ModelsGrid 
        models={models}
        onEdit={(model) => {
          setSelectedModel(model);
          setIsModalOpen(true);
        }}
      />

      {isModalOpen && (
        <TypeForm
          type={selectedModel}
          classifications={classifications}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedModel(null);
          }}
        />
      )}
    </div>
  );
}