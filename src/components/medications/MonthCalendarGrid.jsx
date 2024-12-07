import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function MonthCalendarGrid({ schedule, adherenceData }) {
  if (!schedule?.time_slots?.length) {
    return null;
  }

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const timeSlots = Array.isArray(schedule.time_slots) 
    ? schedule.time_slots.sort() 
    : [schedule.time_slots];

  const getStatusForSlot = (date, timeSlot) => {
    const record = adherenceData.find(r => 
      isSameDay(new Date(r.scheduled_date), date) &&
      r.time_slot === timeSlot
    );
    return record?.status || 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'bg-green-500';
      case 'missed': return 'bg-red-500';
      case 'late': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getDayClasses = (date) => {
    const baseClasses = "relative h-24 border border-gray-200 p-2";
    if (isSameDay(date, today)) {
      return `${baseClasses} bg-blue-50`;
    }
    return baseClasses;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {days.map((date, dayIdx) => (
          <div key={date.toISOString()} className={getDayClasses(date)}>
            <div className="flex justify-between">
              <span className={`text-sm ${
                isSameDay(date, today) ? 'font-bold text-blue-600' : 'text-gray-700'
              }`}>
                {format(date, 'd')}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {timeSlots.map(timeSlot => {
                const status = getStatusForSlot(date, timeSlot);
                return (
                  <div key={timeSlot} className="flex items-center gap-2">
                    <div 
                      className={`h-3 w-3 rounded-full ${getStatusColor(status)}`}
                      title={`${format(date, 'MMM d')} ${timeSlot} - ${status}`}
                    />
                    <span className="text-xs text-gray-500">{timeSlot}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}