import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ActivityDataGrid({ 
  title, 
  data, 
  unit = '', 
  timeRange = 'week',
  onAddReading,
  yAxisLabel,
  wearableInfo = null
}) {
  const [selectedRange, setSelectedRange] = useState(timeRange);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (data?.length) {
      calculateStats();
    }
  }, [data]);

  const timeRanges = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' }
  ];

  const calculateStats = () => {
    const values = data.map(d => parseFloat(d.value));
    setStats({
      latest: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length
    });
  };

  const getBatteryColor = (level) => {
    if (level >= 67) return 'text-green-500';
    if (level >= 34) return 'text-blue-500';
    return 'text-red-500';
  };

  const chartData = {
    labels: data.map(d => format(new Date(d.tracking_date), 'MMM d, yyyy')),
    datasets: [
      {
        label: title,
        data: data.map(d => d.value),
        borderColor: '#78B6BA',
        backgroundColor: '#78B6BA20',
        fill: true,
        tension: 0.4
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
          text: yAxisLabel || title
        }
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4">
          {wearableInfo?.mac_address && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">MAC:</span>
                <span className="font-mono">{wearableInfo.mac_address}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Battery:</span>
                <span className={`font-medium ${getBatteryColor(wearableInfo.battery_level)}`}>
                  {wearableInfo.battery_level}%
                </span>
              </div>
            </div>
          )}
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={onAddReading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Reading
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Latest</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.latest?.toLocaleString()} {unit}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Average</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.avg?.toLocaleString(undefined, { maximumFractionDigits: 1 })} {unit}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Min</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.min?.toLocaleString()} {unit}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Max</div>
            <div className="text-xl font-bold text-gray-900">
              {stats.max?.toLocaleString()} {unit}
            </div>
          </div>
        </div>
      )}

      {data.length > 0 ? (
        <div className="h-[300px]">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">No data available</p>
      )}
    </div>
  );
}