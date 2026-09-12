import React, { useState } from 'react';
import { X, Lock, CreditCard, CheckCircle2, AlertCircle, Truck, DollarSign, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { createOrder } from '../api.ts';
import { Order } from '../types.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, subtotal, shippingFee, tax, total, discountAmount, clearCart } = useCart();
  const { user } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postal_code || '',
    paymentMethod: 'Credit Card',
    cardNumber: '4242 •••• •••• 4242',
    cardExp: '08/28',
    cardCvc: '888',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name || !formData.email || !formData.address || !formData.city) {
      setErrorMsg('Please complete all required shipping address fields.');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer_name: formData.name,
        customer_email: formData.email,
        shipping_address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        phone: formData.phone,
        payment_method: formData.paymentMethod,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        notes: formData.notes,
      };

      const res = await createOrder(orderPayload);
      clearCart();
      onClose();
      onOrderSuccess(res.order);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setErrorMsg(err.message || 'An error occurred while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        id="checkout-modal-container"
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-neutral-900 font-['Space_Grotesk']">
              Secure Checkout · ANSH CART
            </span>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Shipping & Payment Details */}
            <div className="lg:col-span-7 space-y-6">
              {/* Customer Contact */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name *</label>
                    <input
                      id="checkout-name-input"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Anshul Verma"
                      className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3.5 py-2 rounded-lg text-xs border border-neutral-300 focus:border-neutral-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address *</label>
                    <input
                      id="checkout-email-input"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ansh@anshcart.com"
                      className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3.5 py-2 rounded-lg text-xs border border-neutral-300 focus:border-neutral-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
                  <input
                    id="checkout-phone-input"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3.5 py-2 rounded-lg text-xs border border-neutral-300 focus:border-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  Shipping Address
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Street Address *</label>
                  <input
                    id="checkout-address-input"
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="742 Evergreen Terrace, Apt 4B"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3.5 py-2 rounded-lg text-xs border border-neutral-300 focus:border-neutral-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">City *</label>
                    <input
                      id="checkout-city-input"
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="San Francisco"
                      className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3.5 py-2 rounded-lg text-xs border border-neutral-300 focus:border-neutral-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Postal / Zip Code</label>
                    <input
                      id="checkout-postal-input"
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="94107"
                      className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3.5 py-2 rounded-lg text-xs border border-neutral-300 focus:border-neutral-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Special Delivery Instructions (Optional)</label>
                  <textarea
                    id="checkout-notes-input"
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g., Leave package at reception or inside porch"
                    className="w-full bg-neutral-50 focus:bg-white text-neutral-900 px-3.5 py-2 rounded-lg text-xs border border-neutral-300 focus:border-neutral-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  Payment Method
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {['Credit Card', 'Apple Pay', 'Cash on Delivery'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      id={`payment-method-${method.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: method }))}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        formData.paymentMethod === method
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[11px] text-center">{method}</span>
                    </button>
                  ))}
                </div>

                {/* Card Fields if Credit Card */}
                {formData.paymentMethod === 'Credit Card' && (
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Simulated Secure Card Entry (No real charge)</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="Card number"
                        className="w-full bg-white text-neutral-900 px-3 py-1.5 rounded-lg text-xs border border-neutral-300 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="cardExp"
                        value={formData.cardExp}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className="w-full bg-white text-neutral-900 px-3 py-1.5 rounded-lg text-xs border border-neutral-300 font-mono"
                      />
                      <input
                        type="text"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleChange}
                        placeholder="CVC"
                        className="w-full bg-white text-neutral-900 px-3 py-1.5 rounded-lg text-xs border border-neutral-300 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 bg-neutral-50 p-5 rounded-2xl border border-neutral-200 flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 mb-3 font-['Space_Grotesk']">
                  Order Review ({cart.length} unique items)
                </h3>

                {/* Items list */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 text-xs">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-lg object-cover bg-white border border-neutral-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{item.product.title}</p>
                        <p className="text-neutral-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-neutral-900 font-['Space_Grotesk']">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="mt-4 pt-4 border-t border-neutral-200 space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount Coupon</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Expedited Courier Shipping</span>
                    <span className="font-semibold text-neutral-900">
                      {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Sales Tax (8%)</span>
                    <span className="font-semibold text-neutral-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-3 border-t border-neutral-200">
                    <span>Total Due</span>
                    <span className="font-['Space_Grotesk']">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-3">
                <button
                  id="checkout-place-order-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Processing Order into SQLite...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Place Order & Authorize (${total.toFixed(2)})</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-neutral-400 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>256-bit encrypted simulated transaction</span>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
