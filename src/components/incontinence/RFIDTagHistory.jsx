import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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

export default function RFIDTagHistory({ patientId }) {
  const [tagHistory, setTagHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      fetchTagHistory();
    }
  }, [patientId]);

  async function fetchTagHistory() {
    try {
      const { data, error } = await supabase
        .from('rfid_tags')
        .select('*')
        .eq('user_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTagHistory(data || []);
      calculateStats(data || []);
      prepareChartData(data || []);
    } catch (error) {
      console.error('Error fetching tag history:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(tags) {
    if (!tags.length) {
      setStats(null);
      return;
    }

    const today = new Date();
    const todayTags = tags.filter(tag => 
      new Date(tag.created_at).toDateString() === today.toDateString()
    );

    const dailyAverage = tags.length / Math.ceil(
      (new Date(tags[0].created_at) - new Date(tags[tags.length - 1].created_at)) / (1000 * 60 * 60 * 24)
    );

    setStats({
      total: tags.length,
      today: todayTags.length,
      dailyAverage: Math.round(dailyAverage * 10) / 10,
      minDaily: Math.min(...getDailyCounts(tags).map(d => d.count)),
      maxDaily: Math.max(...getDailyCounts(tags).map(d => d.count))
    });
  }

  function getDailyCounts(tags) {
    const counts = {};
    tags.forEach(tag => {
      const date = new Date(tag.created_at).toDateString();
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }

  function prepareChartData(tags) {
    // Get last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();

    const dailyCounts = getDailyCounts(tags);
    const data = {
      labels: dates.map(date => format(new Date(date), 'MMM d')),
      datasets: [
        {
          label: 'Tags Used',
          data: dates.map(date => {
            const count = dailyCounts.find(d => 
              format(new Date(d.date), 'yyyy-MM-dd') === date
            )?.count || 0;
            return count;
          }),
          backgroundColor: '#78B6BA',
          borderRadius: 4
        }
      ]
    };

    setChartData(data);
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading tag history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Tags</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Today's Tags</div>
            <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Daily Average</div>
            <div className="text-2xl font-bold text-gray-900">{stats.dailyAverage}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Min Daily</div>
            <div className="text-2xl font-bold text-gray-900">{stats.minDaily}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Max Daily</div>
            <div className="text-2xl font-bold text-gray-900">{stats.maxDaily}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Tag Usage</h3>
          <div className="h-64">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
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
      )}

      {/* History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Changed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Scanned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tagHistory.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{tag.tag_id}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tag.status === 'wet' ? 'bg-red-100 text-red-800' :
                      tag.status === 'dry' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {tag.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(tag.last_changed).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(tag.last_scanned).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tag.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {tag.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}