import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../services/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const emptyForm = { plant_name: '', disease_name: '', description: '', treatment: '', organic_treatment: '', fertilizer: '', prevention_tips: '', symptoms: '' };

export default function AdminDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [plantFilter, setPlantFilter] = useState('');

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get(`/admin/diseases${plantFilter ? `?plant=${encodeURIComponent(plantFilter)}` : ''}`);
      setDiseases(res.data.diseases || []);
    } catch {
      toast.error('Failed to load diseases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiseases(); }, [plantFilter]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (d) => { setEditing(d); setForm(d); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminApi.put(`/admin/diseases/${editing.id}`, form);
        toast.success('Disease updated');
      } else {
        await adminApi.post('/admin/diseases', form);
        toast.success('Disease added');
      }
      setShowModal(false);
      fetchDiseases();
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this disease?')) return;
    try {
      await adminApi.delete(`/admin/diseases/${id}`);
      toast.success('Disease deleted');
      fetchDiseases();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manage Diseases</h1>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Disease</button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by plant name..."
          value={plantFilter}
          onChange={(e) => setPlantFilter(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3">Plant</th>
                  <th className="px-4 py-3">Disease</th>
                  <th className="px-4 py-3">Treatment</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {diseases.map((d) => (
                  <tr key={d.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium">{d.plant_name}</td>
                    <td className="px-4 py-3">{d.disease_name}</td>
                    <td className="px-4 py-3 text-gray-500">{d.treatment}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(d)} className="mr-2 text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {diseases.length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-400">No diseases found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? 'Edit Disease' : 'Add Disease'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {['plant_name', 'disease_name', 'description', 'treatment', 'organic_treatment', 'fertilizer', 'prevention_tips', 'symptoms'].map((field) => (
                <div key={field}>
                  <label className="label capitalize">{field.replace('_', ' ')}</label>
                  <textarea
                    name={field}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="input"
                    rows={field === 'description' || field === 'treatment' || field === 'organic_treatment' || field === 'prevention_tips' || field === 'symptoms' ? 3 : 1}
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
