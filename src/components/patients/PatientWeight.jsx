import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import LoadingSpinner from '../LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PatientWeight() {
  const { patient } = useOutletContext();
  const [weightGoals, setWeightGoals] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingWeight, setIsAddingWeight] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [goalForm, setGoalForm] = useState({
    starting_weight: '',
    goal_weight: '',
    target_date: ''
  });

  useEffect(() => {
    if (patient?.id) {
      fetchWeightData();
    }
  }, [patient]);

  async function fetchWeightData() {
    try {
      // Fetch weight goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('weight_management')
        .select()
        .eq('user_id', patient.id)
        .eq('active', true)
        .single();

      if (goalsError && goalsError.code !== 'PGRST116') throw goalsError;
      setWeightGoals(goalsData);
      if (goalsData) {
        setGoalForm({
          starting_weight: goalsData.starting_weight,
          goal_weight: goalsData.goal_weight,
          target_date: goalsData.target_date
        });
      }

      // Fetch weight history
      const { data: historyData, error: historyError } = await supabase
        .from('weight_tracking')
        .select()
        .eq('user_id', patient.id)
        .order('measured_at', { ascending: true });

      if (historyError) throw historyError;
      setWeightHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching weight data:', error);
      toast.error('Failed to load weight data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWeight(e) {
    e.preventDefault();
    try {
      const weight = parseFloat(newWeight);
      if (isNaN(weight) || weight <= 0) {
        throw new Error('Please enter a valid weight');
      }

      const weightData = {
        user_id: patient.id,
        weight,
        measured_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('weight_tracking')
        .insert([weightData]);

      if (error) throw error;

      toast.success('Weight recorded successfully');
      setIsAddingWeight(false);
      setNewWeight('');
      fetchWeightData();
    } catch (error) {
      console.error('Error recording weight:', error);
      toast.error(error.message || 'Failed to record weight');
    }
  }

  async function handleSaveGoals(e) {
    e.preventDefault();
    try {
      const goals = {
        user_id: patient.id,
        starting_weight: parseFloat(goalForm.starting_weight),
        goal_weight: parseFloat(goalForm.goal_weight),
        target_date: goalForm.target_date || null,
        active: true
      };

      let error;
      if (weightGoals?.id) {
        ({ error } = await supabase
          .from('weight_management')
          .update(goals)
          .eq('id', weightGoals.id));
      } else {
        ({ error } = await supabase
          .from('weight_management')
          .insert([goals]));
      }

      if (error) throw error;

      toast.success('Weight goals updated successfully');
      setIsEditingGoals(false);
      fetchWeightData();
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save weight goals');
    }
  }

  const chartData = {
    labels: weightHistory.map(record => new Date(record.measured_at).toLocaleDateString()),
    datasets: [
      {
        label: 'Weight',
        data: weightHistory.map(record => record.weight),
        borderColor: '#78B6BA',
        backgroundColor: '#78B6BA20',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Goal Weight',
        data: weightHistory.map(() => weightGoals?.goal_weight),
        borderColor: '#FF6B6B',
        borderDash: [5, 5],
        fill: false,
        tension: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        type: 'category',
        display: true
      },
      y: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Weight (lbs)'
        }
      }
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading weight data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weight Goals</h2>
          <button
            onClick={() => setIsEditingGoals(true)}
            className="text-primary hover:text-primary-dark"
          >
            Edit Goals
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Starting Weight</div>
            <div className="text-2xl font-bold text-gray-900">
              {weightGoals?.starting_weight || '-'} lbs
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Goal Weight</div>
            <div className="text-2xl font-bold text-gray-900">
              {weightGoals?.goal_weight || '-'} lbs
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Current Weight</div>
            <div className="text-2xl font-bold text-gray-900">
              {weightHistory[weightHistory.length - 1]?.weight || '-'} lbs
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weight History</h2>
          <button
            onClick={() => setIsAddingWeight(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            + Add Weight
          </button>
        </div>

        {weightHistory.length > 0 ? (
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-500 text-center">No weight history available.</p>
        )}
      </div>

      {/* Add Weight Modal */}
      {isAddingWeight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Record Weight</h3>
              <button
                onClick={() => {
                  setIsAddingWeight(false);
                  setNewWeight('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddWeight} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingWeight(false);
                    setNewWeight('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
                >
                  Record Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goals Modal */}
      {isEditingGoals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Weight Goals</h3>
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
                <label className="block text-sm font-medium text-gray-700">Starting Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={goalForm.starting_weight}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, starting_weight: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Goal Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={goalForm.goal_weight}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, goal_weight: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Target Date</label>
                <input
                  type="date"
                  value={goalForm.target_date || ''}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, target_date: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
    </div>
  );
}