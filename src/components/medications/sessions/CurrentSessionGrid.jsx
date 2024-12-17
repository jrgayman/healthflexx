import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import StatusButton from '../StatusButton';
import StartSessionButton from '../StartSessionButton';
import AddDosageForm from '../AddDosageForm';
import BluetoothDeviceManager from '../BluetoothDeviceManager';
import SessionColumnTotals from './SessionColumnTotals';
import { TIME_SLOTS } from '../../../constants/medicationSchedule';
import toast from 'react-hot-toast';

export default function CurrentSessionGrid({ patientId }) {
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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
      toast.error('Failed to load records');
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
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
    const dateKey = format(new Date(record.scheduled_date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }
    acc[dateKey][record.scheduled_time] = record;
    return acc;
  }, {});

  // Calculate days based on session start date
  const sessionStartDate = new Date(session.start_date);
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
            Started: {format(new Date(session.start_date), 'MMM d, yyyy')}
            {session.first_use_date && (
              <> · First Use: {format(new Date(session.first_use_date), 'MMM d, yyyy')}</>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAddingDosage(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            + Add Dosage
          </button>
          <StartSessionButton 
            patientId={patientId}
            onSessionStarted={fetchCurrentSession}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {/* Bluetooth Device Row */}
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                BT Devices
              </th>
              {TIME_SLOTS.map(slot => (
                <th key={slot.time} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <BluetoothDeviceManager 
                    sessionId={session.id}
                    timeSlot={slot.id}
                    onUpdate={fetchCurrentSession}
                  />
                </th>
              ))}
            </tr>
            {/* Column Headers Row */}
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <span>Day {index + 1}</span>
                    <span className="text-gray-500">
                      {format(new Date(dateStr), 'M/d/yy')}
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
                        scheduledDate={dateStr}
                        scheduledTime={slot.time}
                        timezone={session.timezone}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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