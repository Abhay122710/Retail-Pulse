import React, { useState } from 'react';
import { X, Star, ShoppingBag, Zap, ShieldCheck, Truck, Plus, Minus, MessageSquarePlus, User, CheckCircle } from 'lucide-react';
import { Product, Customer } from '../../types';
import { ProductImage } from '../common/ProductImage';
import { api } from '../../services/api';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  currentUser: Customer | null;
  onReviewSubmitted: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  allProducts,
  onSelectProduct,
  currentUser,
  onReviewSubmitted,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!product) return null;

  const productReviews = api.getReviewsByProductId(product.product_id);
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.product_id !== product.product_id)
    .slice(0, 4);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setIsSubmittingReview(true);
    api.addReview({
      product_id: product.product_id,
      customer_id: currentUser ? currentUser.customer_id : 'C9999_DEMO',
      customer_name: currentUser ? currentUser.name : 'Verified Customer',
      rating: newRating,
      review_text: newReviewText.trim(),
    });

    setNewReviewText('');
    setIsSubmittingReview(false);
    onReviewSubmitted();
  };

  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 relative my-8 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column: Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                <ProductImage src={product.image_url} alt={product.product_name} />
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-rose-500 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                    {product.discount}% DISCOUNT
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Product Specs & Purchase */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                {/* Brand & Category */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span className="text-indigo-600 font-bold uppercase tracking-wider">{product.category} › {product.subcategory}</span>
                  <span>Brand: {product.brand}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-2">
                  {product.product_name}
                </h1>

                {/* Rating & Stock */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-900 ml-1.5">{product.rating}</span>
                    <span className="text-xs text-slate-500 ml-1">({product.review_count} reviews)</span>
                  </div>

                  {isOutOfStock ? (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      In Stock ({product.stock_quantity} units available)
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-slate-900">
                      ₹{product.final_price.toLocaleString('en-IN')}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-base text-slate-400 line-through">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    )}
                    {product.discount > 0 && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                        Save ₹{((product.price * product.discount) / 100).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Inclusive of all taxes. Free shipping on orders over ₹999.</p>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      disabled={quantity >= product.stock_quantity || isOutOfStock}
                      className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onAddToCart(product, quantity)}
                  disabled={isOutOfStock}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs transition border border-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={() => onBuyNow(product, quantity)}
                  disabled={isOutOfStock}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabbed Reviews & Description Section */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex border-b border-slate-200 gap-6 mb-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-xs font-bold transition border-b-2 ${
                  activeTab === 'details'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Product Overview
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Customer Reviews</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold">
                  {productReviews.length}
                </span>
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <Truck className="w-5 h-5 text-indigo-600 mb-2" />
                  <h4 className="font-bold text-slate-900 mb-1">Fast Delivery</h4>
                  <p>Ships within 24 hours from regional fulfillment centers.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <ShieldCheck className="w-5 h-5 text-purple-600 mb-2" />
                  <h4 className="font-bold text-slate-900 mb-1">1 Year Warranty</h4>
                  <p>Includes official manufacturer warranty and support.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
                  <h4 className="font-bold text-slate-900 mb-1">Quality Tested</h4>
                  <p>100% genuine sealed item verified prior to dispatch.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Submit Review Form */}
                <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
                    Write a Product Review
                  </h4>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-400 hover:scale-110 transition"
                        >
                          <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Share your experience with this product..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newReviewText.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition disabled:opacity-50"
                  >
                    Submit Review
                  </button>
                </form>

                {/* Review List */}
                <div className="space-y-3">
                  {productReviews.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No reviews yet for this product. Be the first to review!</p>
                  ) : (
                    productReviews.map((rev) => (
                      <div key={rev.review_id} className="p-4 rounded-xl border border-slate-100 bg-white space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                              {rev.customer_name.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-900">{rev.customer_name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(rev.review_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-amber-400 gap-0.5 my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-600">{rev.review_text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Customers Also Bought Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Customers also bought</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.product_id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setQuantity(1);
                    }}
                    className="group border border-slate-200/80 rounded-xl p-3 bg-white hover:border-indigo-500 transition cursor-pointer"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                      <ProductImage src={rel.image_url} alt={rel.product_name} />
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                      {rel.product_name}
                    </h4>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      ₹{rel.final_price.toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
