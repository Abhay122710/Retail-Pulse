import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

interface CartPageProps {
  onOpenCheckout: () => void;
  setActiveTab: (tab: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onOpenCheckout, setActiveTab }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useApp();

  const grossValue = cart.reduce((sum, item) => sum + item.product.unit_price * item.units, 0);
  const discountValue = cart.reduce((sum, item) => {
    const disc = item.product.discount_percent
      ? Math.round((item.product.unit_price * item.product.discount_percent) / 100)
      : 0;
    return sum + disc * item.units;
  }, 0);

  const taxValue = Math.round((grossValue - discountValue) * 0.18);
  const shippingValue = grossValue > 50000 ? 0 : 150;
  const netValue = grossValue - discountValue + taxValue + shippingValue;

  if (cart.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-400">
          Browse our high-performance laptops, smartphones, and gaming devices.
        </p>
        <button
          onClick={() => setActiveTab('catalog')}
          className="glow-button px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2"
        >
          <span>Explore Electronics Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">TechMart Shopping Cart</h1>
          <p className="text-xs text-slate-400">
            {cart.reduce((sum, i) => sum + i.units, 0)} items selected for transaction
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Line Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const prod = item.product;
            const discountPerUnit = prod.discount_percent
              ? Math.round((prod.unit_price * prod.discount_percent) / 100)
              : 0;
            const effectiveUnitPrice = prod.unit_price - discountPerUnit;
            const lineTotal = effectiveUnitPrice * item.units;

            return (
              <div
                key={prod.sku}
                className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                    <ImageWithFallback src={prod.image_url} alt={prod.item_title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{prod.sku}</span>
                    <h3 className="text-sm font-semibold text-white line-clamp-1">{prod.item_title}</h3>
                    <p className="text-xs text-slate-400">{prod.brand_name} • {prod.department}</p>
                    <p className="text-xs font-mono text-slate-300 mt-1">
                      ₹{effectiveUnitPrice.toLocaleString('en-IN')} / unit
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  {/* Quantity controls */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => updateCartQuantity(prod.sku, item.units - 1)}
                      className="px-2.5 py-1 text-slate-300 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-cyan-400">{item.units}</span>
                    <button
                      onClick={() => updateCartQuantity(prod.sku, item.units + 1)}
                      className="px-2.5 py-1 text-slate-300 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-white font-mono">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </p>
                    {discountPerUnit > 0 && (
                      <p className="text-[10px] text-emerald-400">
                        Saved ₹{(discountPerUnit * item.units).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(prod.sku)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Order Financial Summary
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Gross Value (Subtotal):</span>
                <span>₹{grossValue.toLocaleString('en-IN')}</span>
              </div>

              {discountValue > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount Value:</span>
                  <span>-₹{discountValue.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Tax Value (18% GST):</span>
                <span>+₹{taxValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Shipping Value:</span>
                <span>{shippingValue === 0 ? 'FREE' : `+₹${shippingValue}`}</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between font-bold text-base text-white">
                <span>Net Value:</span>
                <span className="text-cyan-400 font-sans">₹{netValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={onOpenCheckout}
              className="glow-button w-full py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Proceed to Multi-Step Checkout</span>
            </button>

            <div className="pt-2 text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>TechMart Data Model: Gross, Tax & Net Computed</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
