import type { TechMartProduct } from '../../types';
import { useApp } from '../../context/AppContext';
import { Star, ShoppingCart, Heart, Cpu } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface ProductCardProps {
  product: TechMartProduct;
  onSelectProduct: (product: TechMartProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const isWishlisted = wishlist.includes(product.sku);

  const discountAmount = product.discount_percent
    ? Math.round((product.unit_price * product.discount_percent) / 100)
    : 0;
  const finalPrice = product.unit_price - discountAmount;

  // Extract 2 key specifications for quick badge preview
  const specEntries = Object.entries(product.product_specifications || {}).slice(0, 2);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 relative border border-slate-800 hover:border-cyan-500/40">
      
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.discount_percent && (
          <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-slate-950 text-[11px] font-black tracking-wide shadow-lg">
            {product.discount_percent}% OFF
          </span>
        )}
        {product.is_featured && (
          <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
            Featured
          </span>
        )}
        {product.is_trending && (
          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
            Trending
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.sku);
        }}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition-all ${
          isWishlisted
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            : 'bg-slate-900/60 text-slate-400 hover:text-cyan-400 border border-slate-700/50'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
      </button>

      {/* Product Image */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="w-full h-52 overflow-hidden cursor-pointer relative group-hover:scale-105 transition-transform duration-500"
      >
        <ImageWithFallback
          src={product.image_url}
          alt={product.item_title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Brand & Department */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="text-cyan-400 font-bold uppercase tracking-wider">{product.brand_name}</span>
            <span className="font-mono text-slate-500">{product.sku}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProduct(product)}
            className="text-sm font-semibold text-slate-100 hover:text-cyan-300 cursor-pointer line-clamp-2 leading-snug transition-colors"
          >
            {product.item_title}
          </h3>
        </div>

        {/* Spec Badges Preview */}
        {specEntries.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specEntries.map(([key, val]) => (
              <span
                key={key}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-1"
              >
                <Cpu className="w-2.5 h-2.5 text-cyan-400" />
                <span className="text-slate-400">{key}:</span> {val}
              </span>
            ))}
          </div>
        )}

        {/* Rating & Stock */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating_score}</span>
            <span className="text-[10px] text-slate-400 font-normal">({product.total_reviews})</span>
          </div>

          <div className="text-right">
            {product.available_units > 0 ? (
              <span className="text-[11px] text-emerald-400 font-medium">
                {product.available_units} in stock
              </span>
            ) : (
              <span className="text-[11px] text-rose-400 font-medium">Out of stock</span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              {discountAmount > 0 && (
                <span className="text-xs text-slate-500 line-through font-normal">
                  ₹{product.unit_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">Incl. GST & Tech Insurance</p>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.available_units <= 0}
            className="glow-button px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

      </div>
    </div>
  );
};
