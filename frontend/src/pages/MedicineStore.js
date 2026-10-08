import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingCart, Star, Filter, X, Plus, Minus, Trash2, Leaf, Truck, Shield, RefreshCw, Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import medicinesData from '../data/medicines.json';
import VoiceAssistant from '../components/VoiceAssistant';

const categories = [
  { id: 'all', label: 'All Products', icon: '🌾', color: 'bg-gray-100 text-gray-700' },
  { id: 'fungicide', label: 'Fungicides', icon: '🧪', color: 'bg-blue-50 text-blue-700' },
  { id: 'organic', label: 'Organic', icon: '🌿', color: 'bg-green-50 text-green-700' },
  { id: 'fertilizer', label: 'Fertilizers', icon: '🌱', color: 'bg-emerald-50 text-emerald-700' },
];

export default function MedicineStore() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState('all');
  const [showVoice, setShowVoice] = useState(false);
  const [searchParams] = useSearchParams();
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  useEffect(() => {
    const plantParam = searchParams.get('plant');
    const diseaseParam = searchParams.get('disease');
    if (plantParam) setSelectedPlant(plantParam);
    if (diseaseParam) setSearch(diseaseParam);
  }, [searchParams]);

  const plants = useMemo(() => {
    const plantSet = new Set(medicinesData.map((m) => m.plant));
    return Array.from(plantSet).sort();
  }, []);

  const filtered = useMemo(() => {
    return medicinesData.filter((m) => {
      const matchSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.disease.toLowerCase().includes(search.toLowerCase()) ||
        m.plant.toLowerCase().includes(search.toLowerCase()) ||
        m.brand.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchPlant = selectedPlant === 'all' || m.plant === selectedPlant;
      return matchSearch && matchCategory && matchPlant;
    });
  }, [search, selectedCategory, selectedPlant]);

  const recommendationText = useMemo(() => {
    if (!filtered.length) return '';
    const lines = [
      `Welcome to PlantGuard Medicine Store.`,
      `We have ${filtered.length} products available.`,
    ];
    filtered.slice(0, 5).forEach((m) => {
      lines.push(`${m.name} for ${m.plant} ${m.disease}, price ${m.price} rupees.`);
    });
    lines.push('Select a product to add to cart.');
    return lines.join(' ');
  }, [filtered]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowCart(false);
        setShowVoice(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleAddToCart = (product) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700 pb-16 pt-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur">
              🌿
            </span>
            <h1 className="text-4xl font-bold text-white md:text-5xl">PlantGuard Store</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-100">
              Premium pesticides, organic treatments, and fertilizers for your crops.
              Fast delivery, trusted quality.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-primary-100">
              <span className="flex items-center gap-1"><Truck size={16} /> Free shipping above ₹499</span>
              <span className="flex items-center gap-1"><Shield size={16} /> Certified products</span>
              <span className="flex items-center gap-1"><RefreshCw size={16} /> Easy returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines, diseases, plants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
            <button
              onClick={() => setShowVoice(true)}
              className="btn-primary flex items-center gap-2 bg-primary-700"
            >
              <Mic size={18} />
              Voice Assistant
            </button>
            <button
              onClick={() => setShowCart(true)}
              className="btn-secondary relative flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              Cart
              {totalItems > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : `${cat.color} hover:shadow-sm`
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {plants.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select
                  value={selectedPlant}
                  onChange={(e) => setSelectedPlant(e.target.value)}
                  className="input w-auto py-2 text-sm"
                >
                  <option value="all">All Plants</option>
                  {plants.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Leaf size={48} className="mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700">No products found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="relative p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-3xl">
                      {product.image}
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.category === 'organic' ? 'bg-green-100 text-green-700' :
                      product.category === 'fungicide' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {product.category}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-medium text-primary-600">{product.brand}</p>
                    <h3 className="mt-1 font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {product.plant} • {product.disease}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                      />
                    ))}
                    <span className="ml-1 text-xs text-gray-500">({product.rating})</span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs text-gray-600">{product.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-gray-800">₹{product.price}</span>
                      {product.inStock ? (
                        <span className="ml-2 text-xs text-green-600">In Stock</span>
                      ) : (
                        <span className="ml-2 text-xs text-red-600">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => product.inStock && handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="mt-4 w-full rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-gray-200 bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-800">Shopping Cart ({totalItems})</h2>
                <button onClick={() => setShowCart(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ShoppingCart size={48} className="mb-4 text-gray-300" />
                    <p className="text-gray-500">Your cart is empty</p>
                    <button onClick={() => setShowCart(false)} className="mt-4 text-sm text-primary-600 hover:underline">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-2xl">
                          {item.image}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                          <p className="text-xs text-gray-500">{item.plant} • {item.disease}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-gray-100 p-5">
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">{totalPrice >= 499 ? 'FREE' : '₹49'}</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between text-lg font-bold text-gray-800">
                    <span>Total</span>
                    <span>₹{totalPrice >= 499 ? totalPrice : totalPrice + 49}</span>
                  </div>
                  <Link
                    to="/checkout"
                    onClick={() => setShowCart(false)}
                    className="btn-primary w-full justify-center py-3"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    onClick={clearCart}
                    className="mt-2 w-full text-center text-sm text-gray-500 hover:text-red-600"
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Voice Assistant */}
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
