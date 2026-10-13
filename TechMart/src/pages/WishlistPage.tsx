import React from 'react';
import { useApp } from '../context/AppContext';
import type { TechMartProduct } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

interface WishlistPageProps {
  onSelectProduct: (product: TechMartProduct) => void;
  setActiveTab: (tab: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onSelectProduct, setActiveTab }) => {
  const { wishlist, products } = useApp();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.sku));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-rose-400">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-400">
          Save your favorite laptops, smartphones, and gaming devices to purchase later.
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
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-white">Your Saved Wishlist</h1>
        <p className="text-xs text-slate-400">
          <strong className="text-cyan-400 font-mono">{wishlistedProducts.length}</strong> technology items saved
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistedProducts.map((product) => (
          <ProductCard key={product.sku} product={product} onSelectProduct={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};
