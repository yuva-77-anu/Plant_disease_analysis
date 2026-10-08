import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FlaskConical, BarChart3, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';

const tabs = [
  { to: '/admin/diseases', label: 'Diseases', icon: FlaskConical, desc: 'Manage disease database' },
  { to: '/admin/users', label: 'Users', icon: Users, desc: 'View and manage users' },
];

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.get('/admin/stats');
        setStats(res.data);
      } catch {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Predictions', value: stats?.total_predictions || 0, icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Diseases in DB', value: stats?.total_diseases || 0, icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                    <s.icon size={20} />
                  </span>
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-xl font-bold text-gray-800">{s.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tabs.map((t) => (
              <Link key={t.to} to={t.to} className="card group p-6 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <t.icon size={24} />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{t.label}</h3>
                    <p className="text-sm text-gray-500">{t.desc}</p>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-primary-600" />
                </div>
              </Link>
            ))}
          </div>

          {stats?.top_detected_diseases?.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Top Detected Diseases</h2>
              <div className="space-y-2">
                {stats.top_detected_diseases.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2">
                    <span className="font-medium text-gray-700">{d.plant_name} - {d.disease_name}</span>
                    <span className="text-sm text-gray-500">{d.count} detections</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
