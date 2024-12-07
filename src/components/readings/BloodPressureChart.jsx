import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

export default function BloodPressureChart({ readings }) {
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('1M');

  useEffect(() => {
    if (!readings?.length) return;

    // Filter readings by time range
    const filteredReadings = readings
      .filter(r => {
        if (timeRange === 'ALL') return true;
        
        const date = new Date(r.reading_date);
        const now = new Date();
        const diff = now - date;
        const days = diff / (1000 * 60 * 60 * 24);
        
        switch (timeRange) {
          case '1D': return days <= 1;
          case '1W': return days <= 7;
          case '1M': return days <= 30;
          case '3M': return days <= 90;
          case '6M': return days <= 180;
          case '1Y': return days <= 365;
          default: return true;
        }
      })
      .sort((a, b) => new Date(a.reading_date) - new Date(b.reading_date));

    if (filteredReadings.length === 0) {
      setChartData(null);
      return;
    }

    // Calculate statistics
    const systolicValues = filteredReadings.map(r => r.systolic_value);
    const diastolicValues = filteredReadings.map(r => r.diastolic_value);

    const stats = {
      systolic: {
        min: Math.min(...systolicValues),
        max: Math.max(...systolicValues),
        avg: systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length,
        latest: systolicValues[systolicValues.length - 1]
      },
      diastolic: {
        min: Math.min(...diastolicValues),
        max: Math.max(...diastolicValues),
        avg: diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length,
        latest: diastolicValues[diastolicValues.length - 1]
      }
    };

    // Prepare chart data
    const data = {
      labels: filteredReadings.map(r => format(new Date(r.reading_date), 'MMM d, yyyy HH:mm')),
      datasets: [
        {
          label: 'Systolic',
          data: filteredReadings.map(r => r.systolic_value),
          borderColor: '#78B6BA',
          backgroundColor: '#78B6BA20',
          fill: false
        },
        {
          label: 'Diastolic',
          data: filteredReadings.map(r => r.diastolic_value),
          borderColor: '#60929580',
          backgroundColor: '#60929520',
          fill: false
        }
      ]
    };

    setChartData(data);
  }, [readings, timeRange]);

  if (!chartData) {
    return (
      <div className="text-center text-gray-500">
        No readings available for the selected time period
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="1D">Last 24 Hours</option>
          <option value="1W">Last Week</option>
          <option value="1M">Last Month</option>
          <option value="3M">Last 3 Months</option>
          <option value="6M">Last 6 Months</option>
          <option value="1Y">Last Year</option>
          <option value="ALL">All Time</option>
        </select>
      </div>

      <div className="h-[300px]">
        <Line
          data={chartData}
          options={{
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
              y: {
                title: {
                  display: true,
                  text: 'mmHg'
                },
                suggestedMin: Math.min(
                  ...chartData.datasets[0].data,
                  ...chartData.datasets[1].data
                ) * 0.9,
                suggestedMax: Math.max(
                  ...chartData.datasets[0].data,
                  ...chartData.datasets[1].data
                ) * 1.1
              }
            }
          }}
        />
      </div>
    </div>
  );
}