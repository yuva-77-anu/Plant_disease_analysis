import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Camera, History, TrendingUp, Users, Shield, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ predictions: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/history?limit=1');
        setStats({ predictions: res.data.total || 0 });
      } catch {
        // silently ignore
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    { to: '/predict', label: 'Detect Disease', desc: 'Upload a leaf image to identify diseases', icon: Camera, color: 'bg-blue-500' },
    { to: '/history', label: 'View History', desc: 'Check your previous predictions', icon: History, color: 'bg-purple-500' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.username}!</h1>
        <p className="text-gray-500">Welcome to PlantGuard - Your AI-powered plant disease detection assistant.</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Predictions', value: stats.predictions, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Account Type', value: user?.is_admin ? 'Admin' : 'Farmer', icon: user?.is_admin ? Shield : Users, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Supported Crops', value: '5+', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to} className="card group p-6 transition-shadow hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${a.color} text-white`}>
                  <a.icon size={24} />
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{a.label}</h3>
                  <p className="text-sm text-gray-500">{a.desc}</p>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-primary-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-3 text-xl font-semibold text-gray-800">Supported Crops</h2>
        <div className="flex flex-wrap gap-2">
          {['Tomato', 'Potato', 'Rice', 'Maize', 'Cotton'].map((crop) => (
            <span key={crop} className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              {crop}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
