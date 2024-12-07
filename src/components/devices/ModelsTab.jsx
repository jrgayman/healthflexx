import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import ModelCard from './ModelCard';
import ModelForm from './ModelForm';

export default function ModelsTab({ deviceTypes, classifications, onUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  const handleSave = async (modelData) => {
    try {
      let error;
      if (selectedModel) {
        ({ error } = await supabase
          .from('device_types')
          .update(modelData)
          .eq('id', selectedModel.id));
      } else {
        ({ error } = await supabase
          .from('device_types')
          .insert([modelData]));
      }

      if (error) throw error;
      toast.success(selectedModel ? 'Model updated!' : 'Model added!');
      onUpdate();
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('Failed to save model');
      throw error;
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {deviceTypes.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onEdit={() => {
              setSelectedModel(model);
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      {/* Model Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedModel ? 'Edit Model' : 'Add Model'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedModel(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ModelForm
              model={selectedModel}
              classifications={classifications}
              onSave={handleSave}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedModel(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}