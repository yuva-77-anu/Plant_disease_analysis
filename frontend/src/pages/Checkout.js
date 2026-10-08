import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, Truck, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'card',
  });

  const shipping = totalPrice >= 499 ? 0 : 49;
  const tax = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + shipping + tax;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.fullName || !form.phone || !form.address || !form.city || !form.pincode) {
        toast.error('Please fill all required fields');
        return;
      }
      setStep(2);
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setOrderPlaced(true);
    clearCart();
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-gray-100 p-4">
          <CreditCard size={48} className="text-gray-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Add some products before checkout</p>
        <Link to="/store" className="btn-primary mt-6">
          Browse Store
        </Link>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-800">Order Confirmed!</h2>
        <p className="mt-2 max-w-md text-gray-600">
          Thank you for your purchase. Your order has been placed successfully and will be delivered soon.
        </p>
        <p className="mt-2 text-sm text-gray-500">Order ID: #PG{Date.now().toString(36).toUpperCase()}</p>
        <div className="mt-8 flex gap-4">
          <Link to="/store" className="btn-primary">Continue Shopping</Link>
          <Link to="/dashboard" className="btn-secondary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/store" className="flex items-center gap-1 text-gray-600 hover:text-primary-600">
            <ChevronLeft size={20} />
            Back to Store
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="card p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">1</div>
                    <h2 className="text-lg font-bold text-gray-800">Shipping Information</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="label">Full Name *</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="input pl-9" required />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="email" name="email" value={form.email} onChange={handleChange} className="input pl-9" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Phone Number *</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input pl-9" required />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Address *</label>
                      <textarea name="address" value={form.address} onChange={handleChange} rows="2" className="input" required />
                    </div>
                    <div>
                      <label className="label">City *</label>
                      <input type="text" name="city" value={form.city} onChange={handleChange} className="input" required />
                    </div>
                    <div>
                      <label className="label">State *</label>
                      <input type="text" name="state" value={form.state} onChange={handleChange} className="input" required />
                    </div>
                    <div>
                      <label className="label">Pincode *</label>
                      <input type="text" name="pincode" value={form.pincode} onChange={handleChange} className="input" required />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary mt-6 w-full py-3">
                    Continue to Payment
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="card p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">2</div>
                    <h2 className="text-lg font-bold text-gray-800">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Pay securely with your card' },
                      { id: 'upi', label: 'UPI / Net Banking', icon: Truck, desc: 'Instant payment via UPI' },
                      { id: 'cod', label: 'Cash on Delivery', icon: Truck, desc: 'Pay when you receive (COD fee ₹40)' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                          form.paymentMethod === method.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={form.paymentMethod === method.id}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                          <method.icon size={20} className={form.paymentMethod === method.id ? 'text-primary-600' : 'text-gray-400'} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                        <div className={`ml-auto h-5 w-5 rounded-full border-2 ${
                          form.paymentMethod === method.id ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                        }`}>
                          {form.paymentMethod === method.id && (
                            <div className="flex h-full w-full items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                      <ChevronLeft size={16} />
                      Back
                    </button>
                    <button type="submit" disabled={isProcessing} className="btn-primary flex-1 justify-center py-3">
                      {isProcessing ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processing...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Order Summary</h3>
              <div className="max-h-64 space-y-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.image}</span>
                      <div>
                        <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-700">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
              {totalPrice < 499 && (
                <p className="mt-2 text-xs text-gray-500">Add ₹{499 - totalPrice} more for free shipping</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
