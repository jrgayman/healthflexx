import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdherenceGrid from './AdherenceGrid';
import toast from 'react-hot-toast';

export default function MedicationSchedule({ schedule, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [adherenceData, setAdherenceData] = useState([]);

  const frequencyLabels = {
    qd: 'Once daily',
    bid: 'Twice daily',
    tid: 'Three times daily',
    qid: 'Four times daily'
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      // Update schedule
      const { error: updateError } = await supabase
        .from('patient_medication_schedules')
        .update({
          active: formData.get('active') === 'on',
          end_date: formData.get('end_date') || null
        })
        .eq('id', schedule.id);

      if (updateError) throw updateError;

      toast.success('Schedule updated successfully');
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  }

  async function fetchAdherenceHistory() {
    try {
      const { data, error } = await supabase
        .from('medication_adherence_records')
        .select('*')
        .eq('schedule_id', schedule.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setAdherenceData(data || []);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching adherence history:', error);
      toast.error('Failed to load adherence history');
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{schedule.brand_name}</h3>
          <p className="text-sm text-gray-500">{schedule.generic_name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-primary hover:text-primary-dark"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary hover:text-primary-dark"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="end_date"
              defaultValue={schedule.end_date}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="active"
                defaultChecked={schedule.active}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700">Frequency</div>
            <div className="text-sm text-gray-900">{frequencyLabels[schedule.frequency_code]}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700">Schedule Times</div>
            <div className="flex flex-wrap gap-2">
              {schedule.time_slots?.map((time, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                >
                  {time}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700">Date Range</div>
            <div className="text-sm text-gray-900">
              {new Date(schedule.start_date).toLocaleDateString()} - 
              {schedule.end_date ? new Date(schedule.end_date).toLocaleDateString() : 'Ongoing'}
            </div>
          </div>

          <div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              schedule.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {schedule.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          {showHistory && adherenceData.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Adherence History</h4>
              <AdherenceGrid 
                schedule={schedule}
                adherenceData={adherenceData}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}