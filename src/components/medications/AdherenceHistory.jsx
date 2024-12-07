import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import SessionHistoryGrid from './SessionHistoryGrid';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdherenceHistory({ scheduleId }) {
  const [session, setSession] = useState(null);
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scheduleId) {
      fetchData();
    }
  }, [scheduleId]);

  async function fetchData() {
    try {
      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('medication_session_summary')
        .select('*')
        .eq('session_id', scheduleId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // Fetch tracking records
      const { data: recordsData, error: recordsError } = await supabase
        .from('medication_tracking_records')
        .select('*')
        .eq('session_id', scheduleId)
        .order('scheduled_date')
        .order('scheduled_time');

      if (recordsError) throw recordsError;
      setTrackingRecords(recordsData || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Session not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SessionHistoryGrid 
        session={session}
        trackingRecords={trackingRecords}
      />
    </div>
  );
}