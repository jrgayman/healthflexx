import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ActivityDataGrid from './ActivityDataGrid';
import AddReadingModal from './AddReadingModal';

export default function ActivityGrids({ activityData, onAddReading, wearableInfo }) {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingTypes, setTrackingTypes] = useState([]);

  useEffect(() => {
    fetchTrackingTypes();
  }, []);

  async function fetchTrackingTypes() {
    try {
      const { data, error } = await supabase
        .from('activity_tracking_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setTrackingTypes(data || []);
    } catch (error) {
      console.error('Error fetching tracking types:', error);
    }
  }

  const handleAddReading = (metric) => {
    setSelectedMetric(metric);
    setIsModalOpen(true);
  };

  const handleSubmitReading = (value) => {
    onAddReading(selectedMetric.code, value);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        {trackingTypes.map(type => (
          <ActivityDataGrid
            key={type.code}
            title={`${type.icon} ${type.name}`}
            data={activityData[type.code] || []}
            unit={type.unit}
            onAddReading={() => handleAddReading(type)}
            yAxisLabel={`${type.name} (${type.unit})`}
            wearableInfo={wearableInfo}
          />
        ))}
      </div>

      {selectedMetric && (
        <AddReadingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMetric(null);
          }}
          onSubmit={handleSubmitReading}
          title={selectedMetric.name}
          unit={selectedMetric.unit}
          placeholder={`Enter ${selectedMetric.name.toLowerCase()}`}
        />
      )}
    </div>
  );
}