import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdherenceGrid from '../../components/medications/AdherenceGrid';
import AdherenceStats from '../../components/medications/AdherenceStats';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MedicationCurrentView() {
  const { scheduleId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [adherenceData, setAdherenceData] = useState([]);
  const [stats, setStats] = useState(null);
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

      // Calculate date range for current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch adherence records
      const { data: adherenceRecords, error: adherenceError } = await supabase
        .from('medication_adherence_records')
        .select('*')
        .eq('schedule_id', scheduleId)
        .gte('scheduled_date', startDate.toISOString())
        .lte('scheduled_date', endDate.toISOString())
        .order('scheduled_date');

      if (adherenceError) throw adherenceError;
      setAdherenceData(adherenceRecords || []);

      // Calculate statistics
      if (adherenceRecords?.length) {
        const taken = adherenceRecords.filter(r => r.status === 'taken').length;
        const missed = adherenceRecords.filter(r => r.status === 'missed').length;
        const late = adherenceRecords.filter(r => r.status === 'late').length;
        const total = adherenceRecords.length;

        setStats({
          total_doses: total,
          doses_taken: taken,
          doses_missed: missed,
          doses_late: late,
          adherence_rate: Math.round((taken / total) * 100)
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load medication data');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading medication schedule..." />;
  }

  if (!schedule) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Schedule Not Found</h1>
          <Link
            to="/admin/medication-adherence"
            className="text-primary hover:text-primary-dark"
          >
            ← Back to Medication Adherence
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link 
          to="/admin/medication-adherence"
          className="text-primary hover:text-primary-dark inline-flex items-center mb-4"
        >
          ← Back to Medication Adherence
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Current Month Adherence
        </h1>
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

        <AdherenceStats stats={stats} />
        <AdherenceGrid 
          schedule={schedule}
          adherenceData={adherenceData}
        />
      </div>
    </div>
  );
}