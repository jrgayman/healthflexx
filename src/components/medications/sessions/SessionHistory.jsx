import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import SessionHistoryGrid from './SessionHistoryGrid';
import SessionHistoryStats from './SessionHistoryStats';
import toast from 'react-hot-toast';

export default function SessionHistory({ patientId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const SESSIONS_PER_PAGE = 5;

  useEffect(() => {
    if (patientId) {
      fetchSessions();
    }
  }, [patientId, page]);

  async function fetchSessions() {
    try {
      const from = (page - 1) * SESSIONS_PER_PAGE;
      const to = from + SESSIONS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('medication_session_summary')
        .select('*', { count: 'exact' })
        .eq('patient_id', patientId)
        .order('start_date', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setSessions(prev => page === 1 ? data : [...prev, ...data]);
      setHasMore(count > (page * SESSIONS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetails(session) {
    try {
      const { data: records, error } = await supabase
        .from('medication_tracking_records')
        .select('*')
        .eq('session_id', session.session_id)
        .order('scheduled_date')
        .order('scheduled_time');

      if (error) throw error;
      setSessionDetails(records);
      setSelectedSession(session);
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast.error('Failed to load session details');
    }
  }

  if (loading && page === 1) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Session History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Doses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((session) => {
                const nonPendingDoses = session.total_doses - (session.doses_pending || 0);
                
                return (
                  <tr key={session.session_id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {format(parseISO(session.start_date), 'MMM d, yyyy')} - {format(parseISO(session.end_date), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {session.total_doses} ({session.doses_pending || 0} pending)
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="text-green-600">
                          Taken: {session.doses_taken}/{nonPendingDoses}
                        </div>
                        <div className="text-orange-600">
                          Overtaken: {session.doses_overtaken}/{nonPendingDoses}
                        </div>
                        <div className="text-red-600">
                          Missed: {session.doses_missed}/{nonPendingDoses}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetails(session)}
                        className="text-primary hover:text-primary-dark"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="text-primary hover:text-primary-dark"
            >
              Load More Sessions
            </button>
          </div>
        )}
      </div>

      {selectedSession && sessionDetails && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
            <button
              onClick={() => {
                setSelectedSession(null);
                setSessionDetails(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <SessionHistoryStats records={sessionDetails} />
          <SessionHistoryGrid session={selectedSession} trackingRecords={sessionDetails} />
        </div>
      )}
    </div>
  );
}