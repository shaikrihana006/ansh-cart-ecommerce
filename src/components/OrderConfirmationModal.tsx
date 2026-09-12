import React from 'react';
import { CheckCircle, Package, Truck, Home, Printer, ArrowRight, X } from 'lucide-react';
import { Order } from '../types.ts';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="order-confirmation-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        id="order-confirmation-container"
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/70">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Order Confirmed & Stored in SQLite
          </span>
          <button
            id="close-confirmation-btn"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Success Banner */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-900 font-['Space_Grotesk']">
              Thank you, {order.customer_name}!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
              Your order has been recorded in the ANSH CART SQLite database. A confirmation has been sent to{' '}
              <strong className="text-neutral-900">{order.customer_email}</strong>.
            </p>
            <div className="inline-block px-3.5 py-1.5 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono font-bold text-neutral-800">
              Receipt #: {order.order_number}
            </div>
          </div>

          {/* Fulfillment Timeline */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-4">
              Estimated Delivery Tracking
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1 shadow-xs">
                  ✓
                </div>
                <span className="font-bold text-neutral-900">Confirmed</span>
                <span className="text-[10px] text-neutral-500">Recorded</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs mb-1 shadow-xs">
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-bold text-neutral-900">Preparing</span>
                <span className="text-[10px] text-neutral-500">Quality Check</span>
              </div>
              <div className="flex flex-col items-center opacity-40">
                <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-xs mb-1">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-medium text-neutral-700">In Transit</span>
                <span className="text-[10px] text-neutral-400">Expedited</span>
              </div>
              <div className="flex flex-col items-center opacity-40">
                <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold text-xs mb-1">
                  <Home className="w-4 h-4" />
                </div>
                <span className="font-medium text-neutral-700">Delivered</span>
                <span className="text-[10px] text-neutral-400">2-3 Business Days</span>
              </div>
            </div>
          </div>

          {/* Order Details & Summary */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="p-3.5 bg-neutral-100/70 border-b border-neutral-200 text-xs font-bold text-neutral-800 flex justify-between">
              <span>Items Purchased</span>
              <span>Total: ${order.total_amount.toFixed(2)}</span>
            </div>
            <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto p-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-2 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_image}
                      alt={item.product_title}
                      className="w-10 h-10 rounded-md object-cover bg-neutral-100 border border-neutral-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-semibold text-neutral-900">{item.product_title}</p>
                      <p className="text-neutral-500 text-[11px]">Qty: {item.quantity} · ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 font-['Space_Grotesk']">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-3.5 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-600 space-y-1">
              <div className="flex justify-between">
                <span>Shipping Address:</span>
                <span className="font-medium text-neutral-900 text-right">
                  {order.shipping_address}, {order.city} {order.postal_code}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium text-neutral-900">{order.payment_method}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="confirmation-view-history-btn"
              onClick={() => {
                onClose();
                onViewOrders();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>View in My Orders History</span>
            </button>
            <button
              id="confirmation-continue-shop-btn"
              onClick={onClose}
              className="py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
