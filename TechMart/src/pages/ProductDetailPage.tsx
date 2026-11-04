import React, { useState, useEffect } from 'react';
import type { TechMartProduct } from '../types';
import { useApp } from '../context/AppContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { connectorTracker } from '../services/connectorTracker';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Warehouse, 
  Cpu, 
  ArrowLeft,
  MessageSquare,
  Send,
  Zap,
  ShieldCheck
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
    <div className="space-y-10 pb-16">
      
      {/* Back Button Navigation */}
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-slate-300 hover:text-slate-900 transition-all flex items-center gap-2 shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT: Product Image & Badges */}
        <div className="space-y-4">
          <div className="relative w-full h-[450px] rounded-3xl overflow-hidden bg-white border border-slate-200/80 p-8 shadow-xs flex items-center justify-center">
            <ImageWithFallback
              src={product.image_url}
              alt={product.item_title}
              className="w-full h-full object-contain"
            />

            {/* Badges */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
              {product.discount_percent && (
                <span className="px-3 py-1 rounded-full bg-[#FF5530] text-white font-black text-xs shadow-xs">
                  -{product.discount_percent}% OFF
                </span>
              )}
              {product.is_featured && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs uppercase tracking-wider shadow-xs">
                  Bestseller
                </span>
              )}
            </div>

            <button
              onClick={() => toggleWishlist(product.sku)}
              className={`absolute top-6 right-6 z-10 p-3 rounded-full transition-all border shadow-xs ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 border-rose-200'
                  : 'bg-white text-slate-400 hover:text-rose-500 border-slate-200'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Warehouse Stock Availability Preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Warehouse className="w-4 h-4 text-[#FF5530]" />
              <span>Multi-Warehouse Live Inventory</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              {productInventory.length > 0 ? (
                productInventory.map((inv) => (
                  <div key={inv.inventory_id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[#FF5530] font-bold">{inv.warehouse_code}</p>
                    <p className="text-slate-600 font-sans mt-0.5">{inv.available_units} units</p>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-slate-500 italic text-[11px] p-2 bg-slate-50 rounded-xl">
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
              <span className="px-3 py-1 rounded-full bg-orange-50 text-[#FF5530] font-bold uppercase tracking-wider border border-orange-200">
                {product.brand_name}
              </span>
              <span className="font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.item_title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-amber-800 font-bold text-xs">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating_score}</span>
              </div>
              <span className="text-xs text-slate-500">({product.total_reviews} verified reviews)</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {product.warranty_months} Months Warranty
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              {discountAmount > 0 && (
                <span className="text-base text-slate-400 line-through">
                  ₹{product.unit_price.toLocaleString('en-IN')}
                </span>
              )}
              {discountAmount > 0 && (
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Save ₹{discountAmount.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Inclusive of all taxes & GST invoice available</p>
          </div>

          {/* Technical Specifications Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#FF5530]" />
              <span>Hardware Specifications</span>
            </h3>

            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden divide-y divide-slate-100 text-xs shadow-xs">
              {Object.entries(product.product_specifications || {}).map(([key, val]) => (
                <div key={key} className="grid grid-cols-3 p-3 hover:bg-slate-50 transition-colors">
                  <span className="font-semibold text-slate-500">{key}</span>
                  <span className="col-span-2 text-slate-800 font-medium font-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-slate-700 hover:text-black font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 text-xs font-mono font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.available_units, quantity + 1))}
                  className="px-3.5 py-1.5 text-slate-700 hover:text-black font-bold text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Max {product.available_units} units in stock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.available_units <= 0}
                className="px-6 py-4 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.available_units <= 0}
                className="px-6 py-4 rounded-full bg-[#FF5530] hover:bg-[#E04420] text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-orange-500/25 transition-all hover:scale-102"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now (Instant Checkout)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* REVIEWS & COMMUNITY SECTION */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200/80 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#FF5530]" />
            <h2 className="text-xl font-bold text-slate-900">Customer Reviews ({productReviews.length})</h2>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {productReviews.length > 0 ? (
            productReviews.map((r) => (
              <div key={r.review_code} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{r.user_code}</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(r.review_timestamp).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{r.review_text}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No reviews yet for this product. Be the first to review!</p>
          )}
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleAddReview} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Write a Product Review</h4>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Rating:</span>
            <div className="flex gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setNewReviewRating(star)}
                  className={`w-4 h-4 ${star <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                />
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            placeholder="Share your experience with this tech product..."
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:border-[#FF5530] focus:outline-none"
          />

          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-[#FF5530] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Review</span>
          </button>
        </form>

      </section>

    </div>
  );
};
