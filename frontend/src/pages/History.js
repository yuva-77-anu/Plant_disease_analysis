import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Leaf, Calendar, Image as ImageIcon, Search } from 'lucide-react';

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/history?limit=10&offset=${(p - 1) * 10}`);
      setPredictions(res.data.predictions || []);
      setTotalPages(Math.ceil((res.data.total || 0) / (res.data.limit || 10)) || 1);
      setPage(p);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Prediction History</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : predictions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <Search size={48} className="mb-3 text-gray-300" />
          <p className="text-gray-500">No predictions yet. Upload a leaf image to get started.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {predictions.map((p) => (
              <div key={p.id} className="card p-4 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <Leaf size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{p.plant_name}</h3>
                    <p className="text-sm text-red-600 font-medium">{p.disease_name}</p>
                    <p className="text-xs text-gray-400">Confidence: {p.confidence}%</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(p.created_at).toLocaleDateString()}</span>
                  {p.image_path && <span className="flex items-center gap-1"><ImageIcon size={12} /> Image</span>}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button onClick={() => fetchHistory(page - 1)} disabled={page === 1} className="btn-secondary">Previous</button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => fetchHistory(page + 1)} disabled={page === totalPages} className="btn-secondary">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
