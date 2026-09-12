import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingFee,
    freeShippingThreshold,
    remainingForFreeShipping,
    discountPercent,
    discountAmount,
    tax,
    total,
    promoCode,
    applyPromoCode,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromoCode(inputCode);
    setPromoFeedback(res);
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-drawer-panel"
          className="w-screen max-w-md bg-white shadow-2xl border-l border-neutral-200 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-bold text-neutral-900 font-['Space_Grotesk']">
                Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              id="close-cart-drawer-btn"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-100 text-xs">
            <div className="flex justify-between items-center mb-1.5">
              {remainingForFreeShipping > 0 ? (
                <span className="text-amber-900 font-medium">
                  Add <strong className="font-bold">${remainingForFreeShipping.toFixed(2)}</strong> more to get Free Shipping!
                </span>
              ) : (
                <span className="text-emerald-800 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Unlocked: Free Expedited Shipping!
                </span>
              )}
              <span className="text-amber-800 font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-neutral-800">Your cart is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Discover thoughtfully curated tools, workspace essentials, and artisan goods.
                </p>
                <button
                  id="cart-empty-shop-now-btn"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Start Exploring
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  id={`cart-item-row-${item.product.id}`}
                  className="flex gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 items-center"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-lg bg-neutral-200 shrink-0 border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      ${item.product.price.toFixed(2)} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                        <button
                          id={`cart-qty-dec-${item.product.id}`}
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-bold text-neutral-800 min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          id={`cart-qty-inc-${item.product.id}`}
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        id={`cart-remove-item-${item.product.id}`}
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Total for item */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-neutral-900 font-['Space_Grotesk']">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      id="cart-promo-code-input"
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Promo code (e.g. ANSH10)"
                      className="w-full bg-white text-neutral-900 pl-8 pr-3 py-1.5 rounded-lg text-xs border border-neutral-300 focus:outline-none focus:border-neutral-500 uppercase"
                    />
                    <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    id="apply-promo-btn"
                    type="submit"
                    className="px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-xs font-semibold hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoFeedback && (
                  <p className={`text-[11px] ${promoFeedback.success ? 'text-emerald-600 font-semibold' : 'text-red-500'}`}>
                    {promoFeedback.message}
                  </p>
                )}
                {promoCode && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                    <span>Applied Coupon: {promoCode} ({discountPercent}% OFF)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </form>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-200/80 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-neutral-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Sales Tax (8%)</span>
                  <span className="font-semibold text-neutral-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total Amount</span>
                  <span className="font-['Space_Grotesk'] text-base">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="cart-proceed-checkout-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
