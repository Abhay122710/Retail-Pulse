import React from 'react';
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../types';
import { ProductImage } from '../common/ProductImage';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelectProduct,
}) => {
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative transform hover:-translate-y-1"
    >
      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-md">
          {product.discount}% OFF
        </span>
      )}

      {/* Stock Status Badge */}
      {isOutOfStock ? (
        <span className="absolute top-3 right-3 z-10 bg-slate-800 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
          Out of Stock
        </span>
      ) : isLowStock ? (
        <span className="absolute top-3 right-3 z-10 bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
          Only {product.stock_quantity} left
        </span>
      ) : null}

      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <ProductImage src={product.image_url} alt={product.product_name} />
        
        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-white transition transform translate-y-2 group-hover:translate-y-0">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            Quick View
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="text-indigo-600 font-semibold">{product.category}</span>
            <span>{product.brand}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition min-h-[40px] mb-2">
            {product.product_name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold text-slate-800 ml-1">{product.rating}</span>
            </div>
            <span className="text-xs text-slate-400">({product.review_count})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{product.final_price.toLocaleString('en-IN')}
              </span>
              {product.discount > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product, e);
            }}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-center ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 active:scale-95'
            }`}
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
