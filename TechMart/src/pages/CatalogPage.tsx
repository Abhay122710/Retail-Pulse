import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { TechMartProduct } from '../types';
import { ProductCard } from '../components/product/ProductCard';
import { 
  Search, 
  SlidersHorizontal, 
  Star, 
  RotateCcw, 
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';

interface CatalogPageProps {
  onSelectProduct: (product: TechMartProduct) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onSelectProduct }) => {
  const { 
    products, 
    searchQuery, 
    setSearchQuery, 
    selectedDepartment, 
    setSelectedDepartment 
  } = useApp();

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('popularity');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Extract all distinct brand names from products catalog
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand_name) brandsSet.add(p.brand_name);
    });
    return Array.from(brandsSet);
  }, [products]);

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All');
    setSelectedBrands([]);
    setMaxPrice(200000);
    setMinRating(0);
    setOnlyInStock(false);
    setSortBy('popularity');
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.item_title.toLowerCase().includes(q);
          const matchBrand = p.brand_name.toLowerCase().includes(q);
          const matchSKU = p.sku.toLowerCase().includes(q);
          const matchDept = p.department.toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchSKU && !matchDept) return false;
        }

        // Department Filter
        if (selectedDepartment !== 'All' && p.department !== selectedDepartment) {
          return false;
        }

        // Brand Filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand_name)) {
          return false;
        }

        // Price Filter
        const discountAmount = p.discount_percent ? (p.unit_price * p.discount_percent) / 100 : 0;
        const effectivePrice = p.unit_price - discountAmount;
        if (effectivePrice > maxPrice) return false;

        // Rating Filter
        if (minRating > 0 && p.rating_score < minRating) return false;

        // Availability Filter
        if (onlyInStock && p.available_units <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        const getPrice = (prod: TechMartProduct) =>
          prod.discount_percent ? prod.unit_price * (1 - prod.discount_percent / 100) : prod.unit_price;

        if (sortBy === 'price-asc') return getPrice(a) - getPrice(b);
        if (sortBy === 'price-desc') return getPrice(b) - getPrice(a);
        if (sortBy === 'rating') return b.rating_score - a.rating_score;
        if (sortBy === 'newest') return b.sku.localeCompare(a.sku);
        // Popularity default
        return b.total_reviews - a.total_reviews;
      });
  }, [products, searchQuery, selectedDepartment, selectedBrands, maxPrice, minRating, onlyInStock, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-cyan-500/20">
        <div>
          <h1 className="text-2xl font-black text-white">Electronics Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing <strong className="text-cyan-400 font-mono">{filteredProducts.length}</strong> technology devices
          </p>
        </div>

        {/* Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2"
          >
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="popularity" className="bg-slate-900">Popularity</option>
              <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
              <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
              <option value="rating" className="bg-slate-900">Highest Rating</option>
              <option value="newest" className="bg-slate-900">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* FILTERS SIDEBAR */}
        <div className={`space-y-6 lg:block ${mobileFilterOpen ? 'block' : 'hidden'}`}>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <span>Filter Products</span>
              </div>
              <button
                onClick={resetFilters}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Department</label>
              <div className="space-y-1">
                {(['All', 'Laptops', 'Smartphones', 'Audio', 'Gaming', 'Computer Accessories', 'Smart Home', 'Wearables'] as const).map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setSelectedDepartment(dept)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedDepartment === dept
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span>{dept}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {dept === 'All' ? products.length : products.filter((p) => p.department === dept).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Brand</label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {availableBrands.map((brand) => {
                  const isChecked = selectedBrands.includes(brand);
                  return (
                    <div
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-cyan-300 transition-colors"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span>{brand}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Max Price Slider Filter */}
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span className="uppercase tracking-wider">Max Price</span>
                <span className="text-cyan-400 font-mono">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹5,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            {/* Min Rating Filter */}
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Minimum Rating</label>
              <div className="grid grid-cols-4 gap-1">
                {[0, 4.0, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`py-1 rounded text-xs font-semibold flex items-center justify-center gap-1 border transition-colors ${
                      minRating === r
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{r === 0 ? 'All' : `${r}+`}</span>
                    {r > 0 && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="border-t border-slate-800 pt-4">
              <label
                onClick={() => setOnlyInStock(!onlyInStock)}
                className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-cyan-300"
              >
                {onlyInStock ? (
                  <CheckSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span>Show Only In-Stock Items</span>
              </label>
            </div>

          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3 space-y-6">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.sku} product={p} onSelectProduct={onSelectProduct} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No electronics devices matched your current filter criteria or search query.
              </p>
              <button
                onClick={resetFilters}
                className="glow-button px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
