import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ActivityGrids from '../../components/activity/ActivityGrids';
import EditWearableModal from '../../components/activity/EditWearableModal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PatientActivity() {
  const { patient } = useOutletContext();
  const [activityGoals, setActivityGoals] = useState(null);
  const [activityData, setActivityData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isEditingWearable, setIsEditingWearable] = useState(false);
  const [goalForm, setGoalForm] = useState({
    daily_step_goal: ''
  });

  useEffect(() => {
    if (patient?.id) {
      fetchActivityData();
    }
  }, [patient]);

  async function fetchActivityData() {
    try {
      // Fetch activity goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('activity_goals')
        .select('*')
        .eq('user_id', patient.id)
        .eq('active', true)
        .single();

      if (goalsError && goalsError.code !== 'PGRST116') throw goalsError;
      setActivityGoals(goalsData);
      if (goalsData) {
        setGoalForm({
          daily_step_goal: goalsData.daily_step_goal
        });
      }

      // Fetch all activity metrics
      const { data: trackingData, error: trackingError } = await supabase
        .from('activity_tracking')
        .select('*')
        .eq('user_id', patient.id)
        .order('tracking_date', { ascending: true });

      if (trackingError) throw trackingError;

      // Group data by tracking type
      const groupedData = {};
      trackingData?.forEach(record => {
        if (!groupedData[record.tracking_type]) {
          groupedData[record.tracking_type] = [];
        }
        groupedData[record.tracking_type].push({
          tracking_date: record.tracking_date,
          value: record.value
        });
      });

      setActivityData(groupedData);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      toast.error('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveGoals(e) {
    e.preventDefault();
    try {
      const goals = {
        user_id: patient.id,
        daily_step_goal: parseInt(goalForm.daily_step_goal),
        active: true
      };

      let error;
      if (activityGoals?.id) {
        ({ error } = await supabase
          .from('activity_goals')
          .update(goals)
          .eq('id', activityGoals.id));
      } else {
        ({ error } = await supabase
          .from('activity_goals')
          .insert([goals]));
      }

      if (error) throw error;

      toast.success('Activity goals updated successfully');
      setIsEditingGoals(false);
      fetchActivityData();
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save activity goals');
    }
  }

  async function handleSaveWearable(data) {
    try {
      const { error } = await supabase
        .from('activity_goals')
        .update(data)
        .eq('id', activityGoals.id);

      if (error) throw error;
      toast.success('Wearable device updated successfully');
      fetchActivityData();
    } catch (error) {
      console.error('Error updating wearable:', error);
      toast.error('Failed to update wearable device');
      throw error;
    }
  }

  async function handleAddReading(trackingType, value) {
    try {
      const { error } = await supabase
        .from('activity_tracking')
        .insert([{
          user_id: patient.id,
          tracking_type: trackingType,
          value: value,
          tracking_date: new Date().toISOString()
        }]);

      if (error) throw error;
      toast.success('Reading added successfully');
      fetchActivityData();
    } catch (error) {
      console.error('Error adding reading:', error);
      toast.error('Failed to add reading');
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading activity data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Activity Goals</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setIsEditingWearable(true)}
              className="text-primary hover:text-primary-dark"
            >
              {activityGoals?.mac_address ? 'Edit Wearable' : 'Add Wearable'}
            </button>
            <button
              onClick={() => setIsEditingGoals(true)}
              className="text-primary hover:text-primary-dark"
            >
              Edit Goals
            </button>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Daily Step Goal</div>
          <div className="text-2xl font-bold text-gray-900">
            {activityGoals?.daily_step_goal?.toLocaleString() || '-'}
          </div>
        </div>
      </div>

      {/* Activity Grids */}
      <ActivityGrids 
        activityData={activityData}
        onAddReading={handleAddReading}
        wearableInfo={activityGoals}
      />

      {/* Edit Goals Modal */}
      {isEditingGoals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Activity Goals</h3>
              <button
                onClick={() => setIsEditingGoals(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Daily Step Goal</label>
                <input
                  type="number"
                  value={goalForm.daily_step_goal}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, daily_step_goal: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditingGoals(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  Save Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Wearable Modal */}
      <EditWearableModal
        isOpen={isEditingWearable}
        onClose={() => setIsEditingWearable(false)}
        onSave={handleSaveWearable}
        currentMacAddress={activityGoals?.mac_address}
        currentBatteryLevel={activityGoals?.battery_level}
      />
    </div>
  );
}