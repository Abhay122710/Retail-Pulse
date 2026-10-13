import React, { useState, useEffect } from 'react';
import type { TechMartProduct } from '../types';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { connectorTracker } from '../services/connectorTracker';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Warehouse, 
  Cpu, 
  ArrowLeft,
  MessageSquare,
  Send,
  Zap
} from 'lucide-react';

interface ProductDetailPageProps {
  product: TechMartProduct;
  onBack: () => void;
  onOpenCheckout: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBack, onOpenCheckout }) => {
  const { addToCart, wishlist, toggleWishlist, reviews, inventory, addReview } = useApp();

  const [quantity, setQuantity] = useState<number>(1);
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);

  useEffect(() => {
    const startTime = Date.now();
    connectorTracker.trackProductViewOpen(product);

    return () => {
      const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      connectorTracker.trackProductViewClose(product.sku, product.item_title, durationSec);
    };
  }, [product.sku, product.item_title]);

  const isWishlisted = wishlist.includes(product.sku);

  const discountAmount = product.discount_percent
    ? Math.round((product.unit_price * product.discount_percent) / 100)
    : 0;
  const finalPrice = product.unit_price - discountAmount;

  // Filter reviews for this SKU
  const productReviews = reviews.filter((r) => r.sku === product.sku);

  // Filter inventory for this SKU across warehouses
  const productInventory = inventory.filter((inv) => inv.sku === product.sku);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    addReview(product.sku, newReviewRating, newReviewText);
    setNewReviewText('');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onOpenCheckout();
  };

  return (
    <div className="space-y-12 pb-12">
      
      {/* Back Button Navigation */}
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:border-cyan-400 hover:text-cyan-400 transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT: Product Image & Badges */}
        <div className="space-y-4">
          <div className="relative w-full h-[420px] rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 p-2 shadow-2xl">
            <ImageWithFallback
              src={product.image_url}
              alt={product.item_title}
              className="w-full h-full object-cover rounded-2xl"
            />

            {/* Badges */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              {product.discount_percent && (
                <span className="px-3 py-1 rounded-xl bg-rose-500 text-slate-950 font-black text-xs shadow-lg">
                  {product.discount_percent}% OFF
                </span>
              )}
              {product.is_featured && (
                <span className="px-3 py-1 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider">
                  Featured Tech
                </span>
              )}
            </div>

            <button
              onClick={() => toggleWishlist(product.sku)}
              className={`absolute top-6 right-6 z-10 p-3 rounded-2xl backdrop-blur-md transition-all ${
                isWishlisted
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-950/70 text-slate-300 hover:text-cyan-400 border border-slate-700/60'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-400' : ''}`} />
            </button>
          </div>

          {/* Warehouse Stock Availability Preview */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Warehouse className="w-4 h-4 text-cyan-400" />
              <span>Multi-Warehouse Live Inventory</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              {productInventory.length > 0 ? (
                productInventory.map((inv) => (
                  <div key={inv.inventory_id} className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-cyan-400 font-bold">{inv.warehouse_code}</p>
                    <p className="text-slate-300 font-sans mt-0.5">{inv.available_units} units</p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-slate-500 italic text-[11px]">
                  Central WH Inventory: {product.available_units} units available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Product Specs & Actions */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold uppercase tracking-wider border border-cyan-500/30">
                {product.brand_name}
              </span>
              <span className="font-mono text-slate-500">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {product.item_title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg text-amber-300 font-bold text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating_score}</span>
              </div>
              <span className="text-xs text-slate-400">({product.total_reviews} verified reviews)</span>
              <span className="text-slate-700">•</span>
              <span className="text-xs text-emerald-400 font-medium">
                {product.warranty_months} Months Warranty
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl glass-card border border-cyan-500/30 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-white">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              {discountAmount > 0 && (
                <span className="text-base text-slate-500 line-through">
                  ₹{product.unit_price.toLocaleString('en-IN')}
                </span>
              )}
              {discountAmount > 0 && (
                <span className="text-xs text-emerald-400 font-bold">
                  Save ₹{discountAmount.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Inclusive of all taxes & GST invoice available</p>
          </div>

          {/* Technical Specifications Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Hardware Specifications</span>
            </h3>

            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden divide-y divide-slate-800 text-xs">
              {Object.entries(product.product_specifications || {}).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3 p-3 hover:bg-slate-800/40 transition-colors">
                  <span className="font-semibold text-slate-400">{key}</span>
                  <span className="col-span-2 text-slate-200 font-medium font-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-300">Quantity:</span>
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-300 hover:text-white font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 text-xs font-mono font-bold text-cyan-400">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.available_units, quantity + 1))}
                  className="px-3 py-1.5 text-slate-300 hover:text-white font-bold text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Max {product.available_units} units
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.available_units <= 0}
                className="glow-button-secondary px-6 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.available_units <= 0}
                className="glow-button px-6 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* REVIEWS & COMMUNITY SECTION */}
      <section className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Customer Reviews ({productReviews.length})</h2>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {productReviews.length > 0 ? (
            productReviews.map((r) => (
              <div key={r.review_code} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{r.user_code}</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(r.review_timestamp).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{r.review_text}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No reviews yet for this product. Be the first to review!</p>
          )}
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleAddReview} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Write a Product Review</h4>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Rating:</span>
            <div className="flex gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setNewReviewRating(star)}
                  className={`w-4 h-4 ${star <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            placeholder="Share your experience with this tech product..."
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />

          <button
            type="submit"
            className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Review</span>
          </button>
        </form>

      </section>

    </div>
  );
};
