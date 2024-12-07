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
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { formatStatValue } from '../../lib/readingUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

export default function ReadingsChart({ readings, readingType }) {
  const [chartData, setChartData] = useState(null);
  const [timeRange, setTimeRange] = useState('1M');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!readings?.length || !readingType) return;

    // Filter readings for this type
    const typeReadings = readings
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

    if (typeReadings.length === 0) {
      setChartData(null);
      setStats(null);
      return;
    }

    // Calculate statistics
    const values = typeReadings.map(r => r.numeric_value);
    const newStats = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
      latest: values[values.length - 1]
    };
    setStats(newStats);

    // Prepare chart data
    const data = {
      labels: typeReadings.map(r => format(new Date(r.reading_date), 'MMM d, yyyy HH:mm')),
      datasets: [
        {
          label: readingType.name,
          data: typeReadings.map(r => r.numeric_value),
          borderColor: '#78B6BA',
          backgroundColor: '#78B6BA20',
          fill: false,
          tension: 0.4
        }
      ]
    };

    setChartData(data);
  }, [readings, readingType, timeRange]);

  if (!chartData) {
    return (
      <div className="text-center text-gray-500">
        No readings available for the selected time period
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-5 gap-2 mb-4 text-sm">
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-500">Latest</div>
          <div className="font-medium">
            {formatStatValue(stats.latest, readingType.code)} {readingType.unit}
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-500">Min</div>
          <div className="font-medium">
            {formatStatValue(stats.min, readingType.code)} {readingType.unit}
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-500">Max</div>
          <div className="font-medium">
            {formatStatValue(stats.max, readingType.code)} {readingType.unit}
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-500">Avg</div>
          <div className="font-medium">
            {formatStatValue(stats.avg, readingType.code)} {readingType.unit}
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-gray-500">Total</div>
          <div className="font-medium">{stats.count}</div>
        </div>
      </div>

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
                display: false
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
                  text: readingType.unit || ''
                },
                suggestedMin: Math.min(...chartData.datasets[0].data) * 0.9,
                suggestedMax: Math.max(...chartData.datasets[0].data) * 1.1
              }
            }
          }}
        />
      </div>
    </div>
  );
}