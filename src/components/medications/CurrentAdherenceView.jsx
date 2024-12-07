import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import MonthCalendarGrid from './MonthCalendarGrid';
import LoadingSpinner from '../LoadingSpinner';

export default function CurrentAdherenceView({ scheduleId }) {
  const [schedule, setSchedule] = useState(null);
  const [adherenceData, setAdherenceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scheduleId) {
      fetchData();
    }
  }, [scheduleId]);

  async function fetchData() {
    try {
      // Fetch schedule details
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('patient_medication_schedule_details')
        .select('*')
        .eq('schedule_id', scheduleId)
        .single();

      if (scheduleError) throw scheduleError;
      setSchedule(scheduleData);

      // Fetch adherence records for current month
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());

      const { data: adherenceRecords, error: adherenceError } = await supabase
        .from('medication_adherence_records')
        .select('*')
        .eq('schedule_id', scheduleId)
        .gte('scheduled_date', format(startDate, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(endDate, 'yyyy-MM-dd'))
        .order('scheduled_date');

      if (adherenceError) throw adherenceError;
      setAdherenceData(adherenceRecords || []);
    } catch (error) {
      console.error('Error fetching adherence data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!schedule) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Schedule not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Month Adherence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Medication</h3>
            <p className="text-lg text-gray-900">{schedule.brand_name}</p>
            <p className="text-sm text-gray-500">{schedule.generic_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Schedule</h3>
            <p className="text-lg text-gray-900">{schedule.frequency_name}</p>
            <p className="text-sm text-gray-500">
              {Array.isArray(schedule.time_slots) 
                ? schedule.time_slots.join(', ')
                : schedule.time_slots
              }
            </p>
          </div>
        </div>

        <MonthCalendarGrid 
          schedule={schedule}
          adherenceData={adherenceData}
        />
      </div>
    </div>
  );
}