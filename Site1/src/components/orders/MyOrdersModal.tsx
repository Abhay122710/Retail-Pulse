import React from 'react';
import { X, ShoppingBag, Package, Calendar, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { Customer, Order } from '../../types';
import { api } from '../../services/api';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Customer | null;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose, currentUser }) => {
  if (!isOpen) return null;

  const allOrders = api.getOrders();
  const customerOrders = currentUser
    ? allOrders.filter((o) => o.customer_id === currentUser.customer_id)
    : allOrders.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Processing':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Confirmed':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 relative my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My Order History
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser ? `Viewing orders for ${currentUser.name}` : 'Showing recent demo orders'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {customerOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Package className="w-12 h-12 stroke-[1.5] mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No orders placed yet</p>
              <p className="text-xs text-slate-400">Your completed purchases will appear here.</p>
            </div>
          ) : (
            customerOrders.map((order) => {
              const orderDetails = api.getOrderById(order.order_id);
              const items = orderDetails ? orderDetails.items : [];

              return (
                <div
                  key={order.order_id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-200 transition shadow-xs space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-indigo-600">{order.order_id}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(order.order_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {order.payment_method}
                      </span>
                    </div>
                  </div>

                  {/* Order Items Table/List */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.order_item_id} className="flex justify-between items-center text-xs py-1 text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <span className="font-semibold">{item.product_name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900">₹{item.total_price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Shipped to {order.shipping_city}, {order.shipping_state}
                    </span>
                    <div className="text-right font-bold text-slate-900">
                      <span>Total: </span>
                      <span className="text-sm text-indigo-600 font-extrabold">
                        ₹{order.total_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
