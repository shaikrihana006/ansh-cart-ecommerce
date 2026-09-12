import React, { useState, useEffect } from 'react';
import { X, Package, Clock, Calendar, CheckCircle2, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchUserOrders } from '../api.ts';
import { Order } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose, onOpenAuth }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailQuery, setEmailQuery] = useState<string>('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const loadOrders = async (lookupEmail?: string) => {
    setLoading(true);
    try {
      const email = lookupEmail || user?.email;
      const data = await fetchUserOrders(email);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (user?.email) {
        setEmailQuery(user.email);
        loadOrders(user.email);
      } else {
        loadOrders();
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div
      id="order-history-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="order-history-modal-container"
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-neutral-900" />
            <div>
              <h2 className="text-base font-bold text-neutral-900 font-['Space_Grotesk']">
                Order History & Invoices
              </h2>
              <p className="text-[11px] text-neutral-500">
                Directly queried from ANSH CART SQLite database table <code className="text-neutral-700 bg-neutral-200/60 px-1 py-0.5 rounded">orders</code>
              </p>
            </div>
          </div>
          <button
            id="close-order-history-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email search if not logged in or lookup */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex-1 max-w-sm flex items-center gap-2">
            <input
              id="order-lookup-email-input"
              type="email"
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              placeholder="Search by customer email..."
              className="flex-1 bg-white text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-500 text-xs"
            />
            <button
              id="order-lookup-search-btn"
              onClick={() => loadOrders(emailQuery)}
              className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            >
              Search
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <button
                id="order-history-signin-btn"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="text-amber-700 hover:text-amber-800 font-semibold underline cursor-pointer text-xs"
              >
                Sign in to view your saved account orders
              </button>
            ) : (
              <span className="text-neutral-600 font-medium">
                Viewing orders for: <strong className="text-neutral-900">{user.email}</strong>
              </span>
            )}
            <button
              id="refresh-orders-btn"
              onClick={() => loadOrders(emailQuery)}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors cursor-pointer"
              title="Refresh orders from SQLite"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              <span className="animate-pulse">Loading orders from SQLite database...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800">No orders found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No orders match this email in the SQLite database. Try placing an order or search using{' '}
                <code className="text-amber-800 font-semibold">ansh@anshcart.com</code> to see the seeded demo order!
              </p>
              <button
                id="demo-order-lookup-btn"
                onClick={() => {
                  setEmailQuery('ansh@anshcart.com');
                  loadOrders('ansh@anshcart.com');
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs hover:bg-amber-200 transition-colors cursor-pointer"
              >
                View Seeded Demo Order (ansh@anshcart.com)
              </button>
            </div>
          ) : (
            orders.map((ord) => {
              const isExpanded = expandedOrder === ord.id;
              const dateFormatted = new Date(ord.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={ord.id}
                  id={`order-card-${ord.order_number}`}
                  className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-all"
                >
                  {/* Order Card Header */}
                  <div
                    onClick={() => setExpandedOrder(isExpanded ? null : ord.id)}
                    className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-neutral-100/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-neutral-900">
                          {ord.order_number}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {ord.order_status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dateFormatted}
                        </span>
                        <span>·</span>
                        <span>Recipient: {ord.customer_name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Total Amount</p>
                        <p className="text-base font-extrabold text-neutral-900 font-['Space_Grotesk']">
                          ${ord.total_amount.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-neutral-600 px-3 py-1.5 bg-white rounded-lg border border-neutral-200">
                        {isExpanded ? 'Hide Details ▲' : 'View Items ▼'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Order Items */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white space-y-4 animate-in fade-in duration-150">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                        Ordered Items ({ord.items?.length || 0})
                      </h4>
                      <div className="divide-y divide-neutral-100">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product_image}
                                alt={item.product_title}
                                className="w-12 h-12 rounded-lg object-cover bg-neutral-100 border border-neutral-200"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-semibold text-neutral-900">{item.product_title}</p>
                                <p className="text-neutral-500">
                                  ${item.price.toFixed(2)} × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-neutral-900 font-['Space_Grotesk']">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery and payment breakdown */}
                      <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                        <div>
                          <span className="font-semibold text-neutral-800 block">Shipping Destination:</span>
                          <span>{ord.shipping_address}, {ord.city} {ord.postal_code}</span>
                          {ord.phone && <span className="block text-neutral-500">Phone: {ord.phone}</span>}
                        </div>
                        <div>
                          <span className="font-semibold text-neutral-800 block">Payment Details:</span>
                          <span>Method: {ord.payment_method}</span>
                          <span className="block text-emerald-700 font-medium">Status: {ord.payment_status}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
