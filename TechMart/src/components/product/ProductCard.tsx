import React from 'react';
import type { TechMartProduct } from '../../types';
import { useApp } from '../../context/AppContext';
import { Star, ShoppingBag, Heart, Check } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface ProductCardProps {
  product: TechMartProduct;
  onSelectProduct: (product: TechMartProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart, wishlist, toggleWishlist, cart } = useApp();
  const isWishlisted = wishlist.includes(product.sku);
  const isInCart = cart.some((item) => item.product.sku === product.sku);

  const discountAmount = product.discount_percent
    ? Math.round((product.unit_price * product.discount_percent) / 100)
    : 0;
  const finalPrice = product.unit_price - discountAmount;

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 relative border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:-translate-y-1">
      
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.is_trending && (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
            New
          </span>
        )}
        {product.discount_percent && (
          <span className="px-2.5 py-0.5 rounded-full bg-[#FF5530] text-white text-[10px] font-black tracking-wide shadow-xs">
            -{product.discount_percent}%
          </span>
        )}
        {product.is_featured && !product.is_trending && (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase tracking-wider shadow-xs">
            Bestseller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.sku);
        }}
        aria-label="Wishlist"
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all shadow-xs ${
          isWishlisted
            ? 'bg-rose-50 text-rose-500 border border-rose-200'
            : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200/60'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image on Clean Light Container */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="w-full h-56 bg-[#f8f9fa] overflow-hidden cursor-pointer relative p-4 flex items-center justify-center"
      >
        <ImageWithFallback
          src={product.image_url}
          alt={product.item_title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span className="text-[#FF5530] font-bold uppercase tracking-wider">{product.brand_name}</span>
            <span className="font-mono text-slate-400">{product.department}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-sm font-bold text-slate-900 group-hover:text-[#FF5530] cursor-pointer line-clamp-1 leading-snug transition-colors"
          >
            {product.item_title}
          </h3>
        </div>

        {/* Rating Score */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating_score)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 fill-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-400 text-[11px] font-medium">({product.total_reviews})</span>
        </div>

        {/* Pricing & Circular Cart Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900">
              ₹{finalPrice.toLocaleString('en-IN')}
            </span>
            {discountAmount > 0 && (
              <span className="text-xs text-slate-400 line-through font-normal">
                ₹{product.unit_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Circular Black Action Button like in reference image */}
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.available_units <= 0}
            title={isInCart ? 'Added to Cart' : 'Add to Cart'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md shrink-0 ${
              isInCart
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 hover:bg-[#FF5530] text-white hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
