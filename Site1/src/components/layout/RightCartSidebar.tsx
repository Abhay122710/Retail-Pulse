import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Crown,
  Lock,
} from 'lucide-react';
import { CartItem, Product } from '../../types';
import { ProductImage } from '../common/ProductImage';

interface RightCartSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export const RightCartSidebar: React.FC<RightCartSidebarProps> = ({
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onAddToCart,
  allProducts,
  onSelectProduct,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Pricing calculations
  let rawSubtotal = 0;
  let productDiscounts = 0;

  cartItems.forEach((item) => {
    const itemRaw = item.product.price * item.quantity;
    const itemDisc = Math.round(item.product.price * (item.product.discount / 100)) * item.quantity;
    rawSubtotal += itemRaw;
    productDiscounts += itemDisc;
  });

  const baseNet = rawSubtotal - productDiscounts;
  const promoDiscount = promoApplied ? Math.round(baseNet * 0.1) : 0;
  const netSubtotal = Math.max(0, baseNet - promoDiscount);
  const shippingCost = cartItems.length === 0 ? 0 : netSubtotal > 999 ? 0 : 99;
  const finalTotal = netSubtotal + shippingCost;
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PULSE10') {
      setPromoApplied(true);
    }
  };

  // "You might also like" items from catalog
  const recommendations = allProducts
    .filter((p) => !cartItems.some((ci) => ci.product.product_id === p.product_id))
    .slice(0, 2);

  // "Recently Viewed" thumbnails
  const recentlyViewed = allProducts.slice(2, 6);

  return (
    <div className="w-80 lg:w-88 flex-shrink-0 bg-white border-l border-slate-200/80 p-5 flex flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto no-scrollbar select-none z-30">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">
              My Cart ({totalCount})
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              title="Close Cart"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="space-y-3">
          {cartItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <ShoppingBag className="w-10 h-10 stroke-[1.2] mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Your cart is empty</p>
              <p className="text-[11px] text-slate-400">Add items from the store to see them here.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.product_id}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => onSelectProduct(item.product)}
                  className="w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-slate-100 p-1 cursor-pointer"
                >
                  <ProductImage src={item.product.image_url} alt={item.product.product_name} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4
                    onClick={() => onSelectProduct(item.product)}
                    className="text-xs font-bold text-slate-800 truncate cursor-pointer hover:text-purple-600 transition"
                  >
                    {item.product.product_name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {item.product.subcategory}
                  </p>
                  <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                    ₹{(item.product.final_price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Quantity Controls & Trash */}
                <div className="flex flex-col items-end gap-1.5">
                  <button
                    onClick={() => onRemoveItem(item.product.product_id)}
                    className="text-slate-400 hover:text-rose-500 transition p-0.5"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center border border-slate-200 rounded-lg bg-white px-1">
                    <button
                      onClick={() => onUpdateQuantity(item.product.product_id, item.quantity - 1)}
                      className="p-1 text-slate-500 hover:text-purple-600"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="px-1.5 text-[11px] font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock_quantity}
                      className="p-1 text-slate-500 hover:text-purple-600 disabled:opacity-30"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code & Summary (Visible when items in cart) */}
        {cartItems.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Promo Code */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                placeholder="Promo Code (PULSE10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 uppercase placeholder:normal-case font-medium text-slate-800"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Apply
              </button>
            </form>

            {promoApplied && (
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 10% Coupon Applied!
              </p>
            )}

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{rawSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>Discount</span>
                <span className="font-semibold">-₹{(productDiscounts + promoDiscount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">
                  {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                <span>Total</span>
                <span className="text-base text-purple-700">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onProceedToCheckout}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-200 transition flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Checkout ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Payment Logos Pill */}
            <div className="flex items-center justify-center gap-2 pt-1 opacity-70">
              <span className="text-[9px] font-bold text-slate-400">We accept:</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">VISA</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">Mastercard</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">UPI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">GPay</span>
            </div>
          </div>
        )}

        {/* "You might also like" recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800">You might also like</h4>
            <div className="space-y-2">
              {recommendations.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition"
                >
                  <div
                    onClick={() => onSelectProduct(item)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-1 border border-slate-100 flex-shrink-0">
                      <ProductImage src={item.image_url} alt={item.product_name} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-[11px] font-extrabold text-slate-900">
                        ₹{item.final_price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddToCart(item, 1)}
                    className="w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition shadow-xs flex-shrink-0 cursor-pointer"
                    title="Add to cart"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* "Recently Viewed" thumbnails */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-800">Recently Viewed</h4>
          <div className="grid grid-cols-4 gap-2">
            {recentlyViewed.map((prod) => (
              <div
                key={prod.product_id}
                onClick={() => onSelectProduct(prod)}
                className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 p-1 hover:border-purple-300 transition cursor-pointer"
                title={prod.product_name}
              >
                <ProductImage src={prod.image_url} alt={prod.product_name} />
              </div>
            ))}
          </div>
        </div>

        {/* "Join ShopPulse Club" Banner Card */}
        <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-4 relative overflow-hidden shadow-md">
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-1.5 text-yellow-300">
              <Crown className="w-4 h-4 fill-yellow-300" />
              <span className="text-xs font-extrabold">Join ShopPulse Club</span>
            </div>
            <p className="text-[11px] text-purple-100 leading-snug">
              Get exclusive offers, early access and more!
            </p>
            <button
              onClick={() => alert('Welcome to the ShopPulse VIP Club! Special discounts unlocked.')}
              className="mt-1 px-4 py-1.5 rounded-full bg-white text-purple-700 text-[11px] font-bold hover:bg-purple-50 transition shadow-xs cursor-pointer"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

