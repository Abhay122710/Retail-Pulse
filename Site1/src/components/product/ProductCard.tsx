import React from 'react';
import { Star, ShoppingBag, Heart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { ProductImage } from '../common/ProductImage';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product, e: React.MouseEvent) => void;
  variant?: 'deal' | 'recommended' | 'standard';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
  isWishlisted = false,
  onToggleWishlist,
  variant = 'standard',
}) => {
  const isOutOfStock = product.stock_quantity === 0;

  // Curated color dots for fashion/tech items matching the screenshot
  const colorDots = ['bg-amber-100', 'bg-stone-400', 'bg-neutral-800'];

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-3xl border border-slate-100/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-4 cursor-pointer relative transform hover:-translate-y-1"
    >
      {/* Top badges: Discount Pill & Wishlist Heart */}
      <div className="flex items-center justify-between w-full mb-2">
        {product.discount > 0 ? (
          <span className="bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
            -{product.discount}%
          </span>
        ) : (
          <span />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product, e);
          }}
          className={`w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs ${
            isWishlisted ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Image Area with soft light backdrop */}
      <div className="relative aspect-square w-full rounded-2xl bg-slate-50/70 overflow-hidden flex items-center justify-center p-2 mb-3">
        <ProductImage src={product.image_url} alt={product.product_name} />

        {/* Quick View Hover Pill */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
            <Eye className="w-3 h-3 text-purple-600" /> Quick View
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-purple-600 transition">
            {product.product_name}
          </h3>

          <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
            {product.subcategory} • {product.brand}
          </p>
        </div>

        {/* Variant specific extras: color swatches or rating */}
        {variant === 'recommended' ? (
          <div className="flex items-center gap-1.5 py-0.5">
            {colorDots.map((dot, idx) => (
              <span key={idx} className={`w-2.5 h-2.5 rounded-full ${dot} border border-slate-200`} />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-800">{product.rating}</span>
            <span className="text-[11px] text-slate-400">({product.review_count})</span>
          </div>
        )}

        {/* Pricing & Add to Cart button */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-50 mt-1">
          <div>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              ₹{product.final_price.toLocaleString('en-IN')}
            </span>
            {product.discount > 0 && (
              <span className="text-[11px] text-slate-400 line-through ml-1.5 font-medium">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, e);
            }}
            disabled={isOutOfStock}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-200 active:scale-90 cursor-pointer'
            }`}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
};
