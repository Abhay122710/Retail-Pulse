import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { TopHeader } from './components/layout/TopHeader';
import { RightCartSidebar } from './components/layout/RightCartSidebar';
import { TrustBanner } from './components/layout/TrustBanner';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/product/HeroBanner';
import { CategoryRow } from './components/product/CategoryRow';
import { PromoStrip } from './components/product/PromoStrip';
import { ProductCard } from './components/product/ProductCard';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { MyOrdersModal } from './components/orders/MyOrdersModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Product, Customer, CartItem, Order } from './types';
import { api } from './services/api';
import { connectorTracker } from './services/connectorTracker';
import { ArrowUpDown, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';

const CART_STORAGE_KEY = 'shoppulse_cart_v1';
const USER_STORAGE_KEY = 'shoppulse_current_user_v1';
const WISHLIST_STORAGE_KEY = 'shoppulse_wishlist_v1';

const MainApp: React.FC = () => {
  const { showToast } = useToast();

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  // Navigation & Filtering State
  const [currentTab, setCurrentTab] = useState<string>('Home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'popularity'>('featured');

  // UI Modals & Drawers
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Initialize Data
  const refreshData = () => {
    setProducts(api.getProducts());
  };

  useEffect(() => {
    refreshData();
    connectorTracker.trackPageView('Home');

    // Restore Cart
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }

    // Restore Wishlist
    const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (savedWishlist) {
      try {
        setWishlistIds(JSON.parse(savedWishlist));
      } catch (e) {
        console.error(e);
      }
    }

    // Restore User
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    } else {
      const defaultCust = api.getCustomers()[0];
      if (defaultCust) setCurrentUser(defaultCust);
    }
  }, []);

  // Save Cart on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Save Wishlist on change
  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Track product details modal open/close
  const handleOpenProductDetails = (product: Product) => {
    setSelectedProduct(product);
    connectorTracker.trackProductViewOpen(product);
  };

  const handleCloseProductDetails = () => {
    connectorTracker.trackProductViewClose();
    setSelectedProduct(null);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.product_id === product.product_id);
      if (existing) {
        return prev.map((item) =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    connectorTracker.trackAddToCart(product, quantity, currentUser?.customer_id);
    showToast('Added to Cart', 'success', `${product.product_name} added to cart.`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.product_id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.product_id !== productId));
    connectorTracker.trackRemoveFromCart(productId, 1);
    showToast('Item Removed', 'info', 'Item removed from shopping cart.');
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    handleCloseProductDetails();
    setIsMobileCartOpen(false);
    setIsCheckoutOpen(true);
    const cartVal =
      cartItems.reduce((acc, item) => acc + item.product.final_price * item.quantity, 0) +
      product.final_price * quantity;
    connectorTracker.trackCheckoutStarted(cartVal, cartItems.length + 1);
  };

  // Wishlist Toggle
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlistIds((prev) => {
      const isAlready = prev.includes(product.product_id);
      if (isAlready) {
        connectorTracker.trackWishlistRemove(product.product_id, currentUser?.customer_id);
        showToast('Wishlist Updated', 'info', `Removed ${product.product_name} from wishlist.`);
        return prev.filter((id) => id !== product.product_id);
      } else {
        connectorTracker.trackWishlistAdd(product.product_id, currentUser?.customer_id);
        showToast('Wishlist Added', 'success', `Saved ${product.product_name} to wishlist.`);
        return [...prev, product.product_id];
      }
    });
  };

  const handleLoginSuccess = (cust: Customer) => {
    setCurrentUser(cust);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(cust));
    connectorTracker.sendEvent('LOGIN', { user_id: cust.customer_id });
    showToast('Signed In', 'success', `Welcome back, ${cust.name}!`);
  };

  const handleLogout = () => {
    if (currentUser) {
      connectorTracker.sendEvent('LOGOUT', { user_id: currentUser.customer_id });
    }
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    showToast('Signed Out', 'info', 'Logged out of account.');
  };

  const handleOrderComplete = (_order: Order) => {
    setCartItems([]);
    refreshData();
  };

  // Search input change handler with telemetry
  const handleSearchInputChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 2) {
      const matchCount = products.filter(
        (p) =>
          p.product_name.toLowerCase().includes(q.toLowerCase()) ||
          p.category.toLowerCase().includes(q.toLowerCase()) ||
          p.brand.toLowerCase().includes(q.toLowerCase())
      ).length;
      connectorTracker.trackSearch(q, matchCount);
    }
  };

  // Tab Selection
  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
    if (tab === 'Home') {
      setSelectedCategory('All');
      setSearchQuery('');
    } else if (tab === 'Categories') {
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'Deals') {
      setSortBy('popularity');
      const el = document.getElementById('deals-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'New Arrivals') {
      setSortBy('featured');
      const el = document.getElementById('recommended-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'Best Sellers') {
      setSortBy('popularity');
    }
  };

  // Filter & Sort Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.final_price <= maxPrice;
    const matchesWishlist = currentTab !== 'Wishlist' || wishlistIds.includes(p.product_id);
    return matchesCategory && matchesSearch && matchesPrice && matchesWishlist;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.final_price - b.final_price;
    if (sortBy === 'price-high') return b.final_price - a.final_price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'popularity') return b.review_count - a.review_count;
    return 0;
  });

  // Curated lists for "Best Deals" and "Recommended for You" matching screenshot
  const bestDeals = products
    .filter((p) => p.discount >= 15)
    .slice(0, 4);

  const recommended = products
    .filter((p) => p.rating >= 4.4)
    .slice(4, 8);

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalValue = cartItems.reduce((acc, item) => acc + item.product.final_price * item.quantity, 0);

  const handleProceedToCheckout = () => {
    setIsMobileCartOpen(false);
    setIsCheckoutOpen(true);
    connectorTracker.trackCheckoutStarted(cartTotalValue, cartTotalCount);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 flex flex-col font-sans">
      {/* Top Telemetry Node Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-slate-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          <strong className="text-white">ShopPulse Pipeline Node:</strong> Streaming real-time e-commerce telemetry to Central Connector (Port 5000).
        </span>
      </div>

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto relative">
        {/* Left Sidebar (Desktop permanent, Mobile drawer) */}
        <div className="hidden lg:block">
          <LeftSidebar
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            currentUser={currentUser}
            wishlistCount={wishlistIds.length}
            onOpenOrders={() => setIsOrdersOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenWishlist={() => {
              setCurrentTab('Wishlist');
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onShopNow={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* Mobile Left Sidebar Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-72 bg-white h-full shadow-2xl">
              <LeftSidebar
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  handleSelectTab(tab);
                  setIsMobileMenuOpen(false);
                }}
                currentUser={currentUser}
                wishlistCount={wishlistIds.length}
                onOpenOrders={() => {
                  setIsMobileMenuOpen(false);
                  setIsOrdersOpen(true);
                }}
                onOpenAuth={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthOpen(true);
                }}
                onOpenAdmin={() => {
                  setIsMobileMenuOpen(false);
                  setIsAdminOpen(true);
                }}
                onOpenWishlist={() => {
                  setIsMobileMenuOpen(false);
                  setCurrentTab('Wishlist');
                }}
                onShopNow={() => {
                  setIsMobileMenuOpen(false);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        )}

        {/* Center Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FC]">
          {/* Top Header */}
          <TopHeader
            searchQuery={searchQuery}
            onSearchChange={handleSearchInputChange}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            onOpenOrders={() => setIsOrdersOpen(true)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenWishlist={() => {
              setCurrentTab('Wishlist');
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            wishlistCount={wishlistIds.length}
            cartCount={cartTotalCount}
            onToggleCart={() => setIsMobileCartOpen(!isMobileCartOpen)}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          {/* Main Body Flow */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
            {/* Hero Section */}
            {selectedCategory === 'All' && searchQuery === '' && currentTab === 'Home' && (
              <HeroBanner
                onShopNow={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* Category Row (Fashion, Beauty, Electronics, Home & Living, Sports, More) */}
            <CategoryRow
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                connectorTracker.sendEvent('CATEGORY_VIEW', { category: cat });
              }}
            />

            {/* 3 Mini Promo Banners: Flash Sale, Free Shipping, New Arrivals */}
            {selectedCategory === 'All' && searchQuery === '' && currentTab === 'Home' && (
              <PromoStrip
                onShopDeals={() => {
                  const el = document.getElementById('deals-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onShopNewArrivals={() => {
                  const el = document.getElementById('recommended-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {/* Section 1: Best Deals for You */}
            {selectedCategory === 'All' && searchQuery === '' && currentTab === 'Home' && (
              <div id="deals-section" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Best Deals for You
                    </h3>
                    <p className="text-xs text-slate-400">Exclusive discounts on trending products</p>
                  </div>
                  <button
                    onClick={() => {
                      setSortBy('popularity');
                      const el = document.getElementById('catalog-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {bestDeals.map((prod) => (
                    <ProductCard
                      key={prod.product_id}
                      product={prod}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onSelectProduct={handleOpenProductDetails}
                      isWishlisted={wishlistIds.includes(prod.product_id)}
                      onToggleWishlist={handleToggleWishlist}
                      variant="deal"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Recommended for You */}
            {selectedCategory === 'All' && searchQuery === '' && currentTab === 'Home' && (
              <div id="recommended-section" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Recommended for You
                    </h3>
                    <p className="text-xs text-slate-400">Curated picks tailored to your style</p>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById('catalog-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {recommended.map((prod) => (
                    <ProductCard
                      key={prod.product_id}
                      product={prod}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onSelectProduct={handleOpenProductDetails}
                      isWishlisted={wishlistIds.includes(prod.product_id)}
                      onToggleWishlist={handleToggleWishlist}
                      variant="recommended"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Full Product Catalog with Filter & Search Controls */}
            <div id="catalog-section" className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {currentTab === 'Wishlist'
                      ? 'My Wishlist'
                      : selectedCategory === 'All'
                      ? 'Full Product Catalog'
                      : `${selectedCategory} Collection`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {sortedProducts.length} of {products.length} verified products
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Price Filter Slider */}
                  <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 text-xs shadow-xs">
                    <span className="text-slate-500 font-semibold">Max: ₹{maxPrice}</span>
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="250"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-24 accent-purple-600 cursor-pointer"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative flex items-center bg-white px-3.5 py-2 rounded-2xl border border-slate-200/80 text-xs font-semibold shadow-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 mr-2" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent focus:outline-none cursor-pointer text-slate-700 pr-2"
                    >
                      <option value="featured">Sort by: Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rating</option>
                      <option value="popularity">Most Popular</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  {(selectedCategory !== 'All' ||
                    searchQuery !== '' ||
                    maxPrice < 5000 ||
                    sortBy !== 'featured' ||
                    currentTab === 'Wishlist') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                        setMaxPrice(5000);
                        setSortBy('featured');
                        setCurrentTab('Home');
                      }}
                      className="p-2 text-slate-500 hover:text-purple-600 bg-white border border-slate-200 rounded-2xl transition shadow-xs cursor-pointer"
                      title="Reset Filters"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Product Grid */}
              {sortedProducts.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3 shadow-xs">
                  <ShoppingBag className="w-12 h-12 text-slate-300 stroke-[1.5] mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">No matching products found</h4>
                  <p className="text-xs text-slate-500">
                    Try adjusting your search query, price slider, or category filter.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setMaxPrice(5000);
                      setCurrentTab('Home');
                    }}
                    className="mt-2 px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-2xl hover:bg-purple-700 transition shadow-xs cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {sortedProducts.map((prod) => (
                    <ProductCard
                      key={prod.product_id}
                      product={prod}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onSelectProduct={handleOpenProductDetails}
                      isWishlisted={wishlistIds.includes(prod.product_id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Trust / Value Proposition Banner matching screenshot */}
            <TrustBanner />
          </main>

          {/* Footer */}
          <Footer
            onOpenAdmin={() => setIsAdminOpen(true)}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>

        {/* Right Cart Sidebar (Desktop Permanent Sticky) */}
        <div className="hidden xl:block">
          <RightCartSidebar
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onProceedToCheckout={handleProceedToCheckout}
            onAddToCart={handleAddToCart}
            allProducts={products}
            onSelectProduct={handleOpenProductDetails}
          />
        </div>

        {/* Mobile Slide-Out Cart Drawer */}
        {isMobileCartOpen && (
          <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setIsMobileCartOpen(false)}
            />
            <div className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl">
              <RightCartSidebar
                onClose={() => setIsMobileCartOpen(false)}
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveCartItem}
                onProceedToCheckout={handleProceedToCheckout}
                onAddToCart={handleAddToCart}
                allProducts={products}
                onSelectProduct={handleOpenProductDetails}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={handleCloseProductDetails}
        onAddToCart={(p, q) => {
          handleAddToCart(p, q);
          handleCloseProductDetails();
        }}
        onBuyNow={handleBuyNow}
        allProducts={products}
        onSelectProduct={handleOpenProductDetails}
        currentUser={currentUser}
        onReviewSubmitted={refreshData}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onOrderComplete={handleOrderComplete}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        currentUser={currentUser}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={refreshData}
        showToast={showToast}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
};

export default App;
