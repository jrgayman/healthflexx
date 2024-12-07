import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdherenceChart({ adherenceData }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (adherenceData?.length) {
      prepareChartData();
    }
  }, [adherenceData]);

  function prepareChartData() {
    // Get last 30 days
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    const data = {
      labels: dates.map(date => format(new Date(date), 'MMM d')),
      datasets: [
        {
          label: 'Taken',
          data: dates.map(date => {
            const dayData = adherenceData.find(d => 
              format(new Date(d.date), 'yyyy-MM-dd') === date
            );
            return dayData?.doses_taken || 0;
          }),
          backgroundColor: '#78B6BA',
          borderRadius: 4
        },
        {
          label: 'Missed',
          data: dates.map(date => {
            const dayData = adherenceData.find(d => 
              format(new Date(d.date), 'yyyy-MM-dd') === date
            );
            return dayData?.doses_missed || 0;
          }),
          backgroundColor: '#EF4444',
          borderRadius: 4
        },
        {
          label: 'Late',
          data: dates.map(date => {
            const dayData = adherenceData.find(d => 
              format(new Date(d.date), 'yyyy-MM-dd') === date
            );
            return dayData?.doses_late || 0;
          }),
          backgroundColor: '#F59E0B',
          borderRadius: 4
        }
      ]
    };

    setChartData(data);
  }

  if (!chartData) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day Adherence History</h3>
      <div className="h-64">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}