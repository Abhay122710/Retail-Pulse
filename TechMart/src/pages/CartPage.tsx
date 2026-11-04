import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
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
  const shippingValue = grossValue > 2500 ? 0 : 150;
  const netValue = grossValue - discountValue + taxValue + shippingValue;

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 border border-slate-200/80 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 mx-auto flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-slate-500">
          Explore our trending electronics, gaming gear, and creator laptops.
        </p>
        <button
          onClick={() => setActiveTab('catalog')}
          className="px-6 py-3 rounded-full bg-slate-950 hover:bg-[#FF5530] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-xs"
        >
          <span>Explore Electronics Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Shopping Cart</h1>
          <p className="text-xs text-slate-500">
            {cart.reduce((sum, i) => sum + i.units, 0)} items selected for transaction
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-500 hover:underline font-semibold"
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
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-50 p-2 flex items-center justify-center">
                    <ImageWithFallback src={prod.image_url} alt={prod.item_title} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#FF5530] font-bold">{prod.sku}</span>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{prod.item_title}</h3>
                    <p className="text-xs text-slate-500">{prod.brand_name} • {prod.department}</p>
                    <p className="text-xs font-mono text-slate-700 font-semibold mt-1">
                      ₹{effectiveUnitPrice.toLocaleString('en-IN')} / unit
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {/* Quantity controls */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full">
                    <button
                      onClick={() => updateCartQuantity(prod.sku, item.units - 1)}
                      className="px-3 py-1 text-slate-700 hover:text-black font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-slate-900">{item.units}</span>
                    <button
                      onClick={() => updateCartQuantity(prod.sku, item.units + 1)}
                      className="px-3 py-1 text-slate-700 hover:text-black font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 font-mono">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </p>
                    {discountPerUnit > 0 && (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        Saved ₹{(discountPerUnit * item.units).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(prod.sku)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove item"
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Value (Subtotal):</span>
                <span className="font-mono text-slate-900 font-semibold">₹{grossValue.toLocaleString('en-IN')}</span>
              </div>

              {discountValue > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount Savings:</span>
                  <span className="font-mono font-bold">-₹{discountValue.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Tax Value (18% GST):</span>
                <span className="font-mono text-slate-900 font-semibold">+₹{taxValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Shipping:</span>
                <span className="font-mono font-semibold text-emerald-600">{shippingValue === 0 ? 'FREE' : `+₹${shippingValue}`}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-base text-slate-900">
                <span>Net Total:</span>
                <span className="text-[#FF5530] font-black">₹{netValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={onOpenCheckout}
              className="w-full py-4 rounded-full bg-[#FF5530] hover:bg-[#E04420] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-102"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Proceed to Checkout</span>
            </button>

            <div className="pt-2 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#FF5530]" />
              <span>TechMart Schema: Gross, Tax & Net Reconciled</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
