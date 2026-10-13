import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';
import { CartItem } from '../../types';
import { ProductImage } from '../common/ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isOpen) return null;

  // Calculate pricing breakdown
  let rawSubtotal = 0;
  let productDiscounts = 0;

  cartItems.forEach((item) => {
    const itemRaw = item.product.price * item.quantity;
    const itemDisc = Math.round(item.product.price * (item.product.discount / 100)) * item.quantity;
    rawSubtotal += itemRaw;
    productDiscounts += itemDisc;
  });

  const baseNet = rawSubtotal - productDiscounts;
  const promoDiscount = promoApplied ? Math.round(baseNet * 0.1) : 0; // 10% promo coupon
  const netSubtotal = Math.max(0, baseNet - promoDiscount);
  const tax = Math.round(netSubtotal * 0.18);
  const shippingCost = cartItems.length === 0 ? 0 : netSubtotal > 999 ? 0 : 99;
  const finalTotal = netSubtotal + tax + shippingCost;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PULSE10') {
      setPromoApplied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Your Shopping Cart</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1">Looks like you haven't added any items to your cart yet.</p>
                </div>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.product.product_id}
                  className="flex gap-4 p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                    <ProductImage src={item.product.image_url} alt={item.product.product_name} />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.product.product_name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.product_id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.product.brand}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(item.product.product_id, item.quantity - 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.product_id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-extrabold text-slate-900">
                          ₹{(item.product.final_price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. PULSE10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
                >
                  Apply
                </button>
              </form>
              {promoApplied && (
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 10% Special Promo Applied!
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal (MRP)</span>
                  <span>₹{rawSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Product Discounts</span>
                  <span>-₹{productDiscounts.toLocaleString('en-IN')}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon (PULSE10)</span>
                    <span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated GST (18%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span>{shippingCost === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${shippingCost}`}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-base text-indigo-600">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
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
