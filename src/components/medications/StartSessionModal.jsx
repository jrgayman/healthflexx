import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

export default function StartSessionModal({ isOpen, onClose, patientId, onSessionStarted }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [timeSlots, setTimeSlots] = useState([
    { id: 1, label: 'Morning', defaultTime: '08:00', time: '08:00', enabled: true, mac: '' },
    { id: 2, label: 'Noon', defaultTime: '12:00', time: '12:00', enabled: true, mac: '' },
    { id: 3, label: 'Afternoon', defaultTime: '16:00', time: '16:00', enabled: true, mac: '' },
    { id: 4, label: 'Evening', defaultTime: '20:00', time: '20:00', enabled: true, mac: '' }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Filter out disabled time slots
      const enabledSlots = timeSlots.filter(slot => slot.enabled);
      
      if (enabledSlots.length === 0) {
        toast.error('Please select at least one time slot');
        return;
      }

      // Validate MAC addresses if provided
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      const invalidMacs = enabledSlots.filter(slot => slot.mac && !macRegex.test(slot.mac));
      if (invalidMacs.length > 0) {
        toast.error('Please enter valid MAC addresses (XX:XX:XX:XX:XX:XX)');
        return;
      }

      // Create session with start date and MAC addresses
      const { data: session, error: sessionError } = await supabase
        .from('medication_sessions')
        .insert([{
          patient_id: patientId,
          start_date: startDate,
          end_date: format(addDays(new Date(startDate), 29), 'yyyy-MM-dd'),
          morning_mac: timeSlots[0].enabled ? timeSlots[0].mac || null : null,
          noon_mac: timeSlots[1].enabled ? timeSlots[1].mac || null : null,
          afternoon_mac: timeSlots[2].enabled ? timeSlots[2].mac || null : null,
          evening_mac: timeSlots[3].enabled ? timeSlots[3].mac || null : null,
          active: true
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create tracking records for each enabled time slot
      const trackingRecords = [];
      for (let i = 0; i <= 29; i++) {
        const currentDate = format(addDays(new Date(startDate), i), 'yyyy-MM-dd');
        enabledSlots.forEach(slot => {
          trackingRecords.push({
            session_id: session.id,
            scheduled_date: currentDate,
            scheduled_time: slot.time + ':00',
            status: 'pending',
            mac_address: slot.mac || null
          });
        });
      }

      const { error: recordsError } = await supabase
        .from('medication_tracking_records')
        .insert(trackingRecords);

      if (recordsError) throw recordsError;

      toast.success('Session started successfully');
      onSessionStarted?.();
      onClose();
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Start New Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            <p className="mt-1 text-sm text-gray-500">
              Session will run for 30 days from start date through {format(addDays(new Date(startDate), 29), 'MMM d, yyyy')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Slots</label>
            <div className="space-y-4">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="space-y-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={slot.enabled}
                        onChange={(e) => {
                          setTimeSlots(slots =>
                            slots.map(s =>
                              s.id === slot.id
                                ? { ...s, enabled: e.target.checked }
                                : s
                            )
                          );
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{slot.label}</span>
                    </label>
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => {
                        setTimeSlots(slots =>
                          slots.map(s =>
                            s.id === slot.id
                              ? { ...s, time: e.target.value }
                              : s
                          )
                        );
                      }}
                      disabled={!slot.enabled}
                      className="block rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm disabled:bg-gray-100"
                    />
                  </div>
                  {slot.enabled && (
                    <div>
                      <input
                        type="text"
                        value={slot.mac}
                        onChange={(e) => {
                          setTimeSlots(slots =>
                            slots.map(s =>
                              s.id === slot.id
                                ? { ...s, mac: e.target.value }
                                : s
                            )
                          );
                        }}
                        placeholder="MAC Address (XX:XX:XX:XX:XX:XX)"
                        pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">Format: XX:XX:XX:XX:XX:XX</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Starting...' : 'Start Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}