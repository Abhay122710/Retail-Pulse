import React from 'react';
import { useApp } from '../context/AppContext';
import type { TechMartProduct } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';

interface WishlistPageProps {
  onSelectProduct: (product: TechMartProduct) => void;
  setActiveTab: (tab: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onSelectProduct, setActiveTab }) => {
  const { wishlist, products } = useApp();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.sku));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center space-y-5 max-w-lg mx-auto my-12 border border-slate-100 shadow-xl shadow-slate-100">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 mx-auto flex items-center justify-center text-[#ff5530]">
          <Heart className="w-10 h-10 fill-[#ff5530]/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Wishlist is Empty</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            Explore our curated collections of premium gadgets, accessories, and tech wear to save your favorite items.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('catalog')}
          className="btn-coral px-8 py-3.5 rounded-full text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-[#ff5530]/20"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#ff5530] text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="w-3.5 h-3.5 fill-[#ff5530]" />
            <span>Saved Favorites</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
          <p className="text-sm text-slate-500 mt-1">
            You have <strong className="text-slate-900 font-bold">{wishlistedProducts.length}</strong> items saved in your personal collection.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('catalog')}
          className="btn-dark px-6 py-2.5 rounded-full text-xs font-bold inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistedProducts.map((product) => (
          <ProductCard key={product.sku} product={product} onSelectProduct={onSelectProduct} />
        ))}
      </div>
    </div>
  );
};
