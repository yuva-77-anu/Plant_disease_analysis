import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Camera, Upload, Loader2, X, Leaf, Bug, FlaskConical, Sprout, ShieldCheck, History, ArrowRight, ShoppingCart, Mic } from 'lucide-react';
import api from '../services/api';
import VoiceAssistant from '../components/VoiceAssistant';

export default function Predict() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchPrevious = async () => {
    try {
      const res = await api.get('/history?limit=1&offset=0');
      const items = res.data.predictions || [];
      setPrevious(items.length ? items[0] : null);
    } catch {
      setPrevious(null);
    }
  };

  useEffect(() => {
    fetchPrevious();
  }, []);

  const recommendationText = result
    ? `Disease detected: ${result.plant_name} ${result.disease_name} with ${result.confidence}% confidence. ${result.symptoms || ''} ${result.treatment || ''} ${result.organic_treatment || ''} ${result.prevention_tips || ''}`
    : '';

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileChange({ target: { files: [f] } });
  };

  const handlePredict = async () => {
    if (!file) return toast.error('Please select an image first');
    setLoading(true);
    setComparing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/predict', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data);
      await fetchPrevious();
      toast.success('Disease detected successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Prediction failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
      setComparing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const imageUrl = result?.image_path ? `http://localhost:5000/uploads/${result.image_path}` : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">Detect Plant Disease</h1>
      <p className="mb-6 text-gray-500">Upload a clear photo of the plant leaf for AI-powered diagnosis.</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/50"
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-64 rounded-xl object-contain" />
                <button onClick={(e) => { e.stopPropagation(); clear(); }} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={48} className="mb-3 text-gray-400" />
                <p className="font-medium text-gray-700">Drop an image here, or click to browse</p>
                <p className="text-sm text-gray-400">Supports JPG, PNG, GIF (max 16MB)</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <button onClick={handlePredict} disabled={!file || loading} className="btn-primary mt-4 w-full py-3">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Camera size={18} /> Detect Disease</>}
          </button>
        </div>

        <div>
          {result && (
            <div className="card animate-fade-in overflow-hidden">
              <div className="bg-primary-600 p-4 text-white">
                <div className="flex items-center gap-2">
                  <Leaf size={20} />
                  <h2 className="text-lg font-bold">Detection Result</h2>
                </div>
              </div>
              <div className="space-y-4 p-5">
                {imageUrl && (
                  <img src={imageUrl} alt="Uploaded leaf" className="mx-auto max-h-48 rounded-lg object-contain" />
                )}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="text-sm text-gray-500">Plant</span>
                  <span className="font-semibold text-gray-800">{result.plant_name}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="text-sm text-gray-500">Disease</span>
                  <span className="font-semibold text-red-600">{result.disease_name}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <span className="text-sm text-gray-500">Confidence</span>
                  <span className="font-semibold text-primary-600">{result.confidence}%</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-gray-700"><Bug size={14} /> Symptoms</h4>
                    <p className="text-sm text-gray-600">{result.symptoms}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-gray-700"><ShieldCheck size={14} /> Treatment</h4>
                    <p className="text-sm text-gray-600">{result.treatment}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-gray-700"><Sprout size={14} /> Organic Treatment</h4>
                    <p className="text-sm text-gray-600">{result.organic_treatment}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-gray-700"><FlaskConical size={14} /> Fertilizer</h4>
                    <p className="text-sm text-gray-600">{result.fertilizer}</p>
                  </div>
                  <div>
                    <h4 className="mb-1 flex items-center gap-1 text-sm font-semibold text-gray-700"><Leaf size={14} /> Prevention Tips</h4>
                    <p className="text-sm text-gray-600">{result.prevention_tips}</p>
                  </div>

                  {result.disease_name.toLowerCase() !== 'healthy' && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Link
                        to={`/store?plant=${encodeURIComponent(result.plant_name)}&disease=${encodeURIComponent(result.disease_name)}`}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Buy Treatment
                      </Link>
                      <button
                        onClick={() => setShowVoice(true)}
                        className="btn-secondary inline-flex items-center gap-2"
                      >
                        <Mic size={16} />
                        Listen
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <History size={16} /> History Comparison
                  </div>
                  {comparing ? (
                    <p className="text-sm text-gray-500">Comparing with your previous detection...</p>
                  ) : previous ? (
                    (() => {
                      const samePlant = previous.plant_name === result.plant_name;
                      const sameDisease = previous.disease_name === result.disease_name;
                      const same = samePlant && sameDisease;
                      return (
                        <div className="space-y-1 text-sm">
                          <p className={same ? 'font-medium text-green-600' : 'font-medium text-amber-600'}>
                            {same
                              ? 'Same plant and disease as your previous detection.'
                              : 'Different from your previous detection.'}
                          </p>
                          <p className="text-gray-600">
                            Previous: <span className="font-semibold">{previous.plant_name}</span> -{' '}
                            <span className="font-semibold">{previous.disease_name}</span>{' '}
                            ({previous.confidence}% confidence)
                          </p>
                          <p className="text-gray-600">
                            Current: <span className="font-semibold">{result.plant_name}</span> -{' '}
                            <span className="font-semibold">{result.disease_name}</span>{' '}
                            ({result.confidence}% confidence)
                          </p>
                          <p className="text-xs text-gray-400">
                            Plant match: {samePlant ? 'Yes' : 'No'} . Disease match: {sameDisease ? 'Yes' : 'No'}
                          </p>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-sm text-gray-500">No previous detection found to compare against.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <Camera size={48} className="mb-3 text-gray-300" />
              <p className="text-gray-400">Upload an image and click Detect Disease to see results here</p>
            </div>
          )}

          {loading && (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
              <Loader2 size={48} className="mb-3 animate-spin text-primary-500" />
              <p className="text-gray-500">Analyzing your image...</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Link to="/history" className="btn-primary inline-flex items-center gap-2 px-5 py-3">
          View History <ArrowRight size={18} />
        </Link>
      </div>

      {showVoice && (
        <VoiceAssistant
          text={recommendationText}
          onClose={() => setShowVoice(false)}
          autoSpeak={true}
        />
      )}
    </div>
  );
}