import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { supabase } from '../../lib/supabase';
import StatusButton from './StatusButton';
import TimezoneSelector from './TimezoneSelector';
import StartSessionButton from './StartSessionButton';
import AddDosageForm from './AddDosageForm';
import SessionColumnTotals from './SessionColumnTotals';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  { time: '08:00:00', label: 'Morning' },
  { time: '12:00:00', label: 'Noon' },
  { time: '16:00:00', label: 'Afternoon' },
  { time: '20:00:00', label: 'Evening' }
];

export default function CurrentSessionGrid({ patientId }) {
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState('America/New_York');
  const [isAddingDosage, setIsAddingDosage] = useState(false);

  useEffect(() => {
    if (patientId) {
      fetchCurrentSession();
    }
  }, [patientId]);

  async function fetchCurrentSession() {
    try {
      const { data, error } = await supabase
        .from('medication_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSession(data);
        await fetchRecords(data.id);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  }

  async function fetchRecords(sessionId) {
    try {
      const { data, error } = await supabase
        .from('medication_tracking_records')
        .select('*')
        .eq('session_id', sessionId)
        .order('scheduled_date')
        .order('scheduled_time');

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error loading records:', error);
      toast.error('Failed to load tracking records');
    }
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No active session found.</p>
          <StartSessionButton 
            patientId={patientId}
            onSessionStarted={fetchCurrentSession}
          />
        </div>
      </div>
    );
  }

  // Group records by date and time
  const recordsByDate = records.reduce((acc, record) => {
    const dateKey = format(parseISO(record.scheduled_date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    acc[dateKey][record.scheduled_time] = record;
    return acc;
  }, {});

  // Calculate days based on session start date
  const sessionStartDate = parseISO(session.start_date);
  const days = Array.from({ length: 30 }, (_, i) => {
    const currentDate = new Date(sessionStartDate);
    currentDate.setDate(sessionStartDate.getDate() + i);
    return format(currentDate, 'yyyy-MM-dd');
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Current Session</h2>
          <div className="text-sm text-gray-500 mt-1">
            Created: {format(parseISO(session.created_at), 'MMM d, yyyy')}
            {session.first_use_date && (
              <> · First Use: {format(parseISO(session.first_use_date), 'MMM d, yyyy')}</>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrint}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 print:hidden"
          >
            Print Report
          </button>
          <button
            onClick={() => setIsAddingDosage(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark print:hidden"
          >
            + Add Dosage
          </button>
          <StartSessionButton 
            patientId={patientId}
            onSessionStarted={fetchCurrentSession}
          />
        </div>
      </div>

      <TimezoneSelector 
        value={timezone}
        onChange={setTimezone}
        className="mb-6 print:hidden"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Day
              </th>
              {TIME_SLOTS.map(slot => (
                <th key={slot.time} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>{slot.label}</div>
                  <SessionColumnTotals 
                    records={records}
                    timeSlot={slot.time}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {days.map((dateStr, index) => (
              <tr key={dateStr}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>Day {index + 1}</span>
                    <span className="text-gray-500">
                      {format(parseISO(dateStr), 'M/d/yy')}
                    </span>
                  </div>
                </td>
                {TIME_SLOTS.map(slot => {
                  const record = recordsByDate[dateStr]?.[slot.time];
                  return (
                    <td key={`${dateStr}-${slot.time}`} className="px-6 py-4 whitespace-nowrap">
                      <StatusButton
                        status={record?.status || 'pending'}
                        count={record?.dose_count}
                        time={record?.taken_at}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-4 text-sm print:mt-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-green-500"></div>
          <span>Taken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-orange-500"></div>
          <span>Overtaken</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-red-500"></div>
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-gray-200"></div>
          <span>Pending</span>
        </div>
      </div>

      {isAddingDosage && (
        <AddDosageForm
          sessionId={session.id}
          onDosageAdded={() => fetchRecords(session.id)}
          onClose={() => setIsAddingDosage(false)}
        />
      )}
    </div>
  );
}