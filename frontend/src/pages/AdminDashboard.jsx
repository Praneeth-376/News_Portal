import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';
import api from '../api';
import Loader from '../components/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalBookmarks: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats || stats);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen size="lg" />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      trend: '+12%',
    },
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      icon: FileText,
      color: 'green',
      trend: '+23%',
    },
    {
      title: 'Total Bookmarks',
      value: stats.totalBookmarks,
      icon: BarChart3,
      color: 'purple',
      trend: '+18%',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'orange',
      trend: '+5%',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your news application metrics
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
            <p className="text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-6 hover:shadow-xl transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {card.trend}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { user: 'John Doe', action: 'Bookmarked Article', time: '2 mins ago', status: 'success' },
                  { user: 'Jane Smith', action: 'Created Account', time: '15 mins ago', status: 'success' },
                  { user: 'Bob Johnson', action: 'Updated Preferences', time: '1 hour ago', status: 'success' },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-300">{row.user}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-400">{row.action}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-500">{row.time}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}