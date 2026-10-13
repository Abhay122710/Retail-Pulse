import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/product/HeroBanner';
import { ProductCard } from './components/product/ProductCard';
import { ProductDetailsModal } from './components/product/ProductDetailsModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { MyOrdersModal } from './components/orders/MyOrdersModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Product, Customer, CartItem, Order } from './types';
import { api } from './services/api';
import { connectorTracker } from './services/connectorTracker';
import { ArrowUpDown, RefreshCw, ShoppingBag } from 'lucide-react';

const CART_STORAGE_KEY = 'shoppulse_cart_v1';
const USER_STORAGE_KEY = 'shoppulse_current_user_v1';

const MainApp: React.FC = () => {
  const { showToast } = useToast();

  // Core Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Filtering & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'popularity'>('featured');

  // Modals UI State
  const [isCartOpen, setIsCartOpen] = useState(false);
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

  // Track product details modal open/close for view & dwell duration
  const handleOpenProductDetails = (product: Product) => {
    setSelectedProduct(product);
    connectorTracker.trackProductViewOpen(product);
  };

  const handleCloseProductDetails = () => {
    connectorTracker.trackProductViewClose();
    setSelectedProduct(null);
  };

  // Save Cart on change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

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
    
    // Trigger Real Event to Retail Pulse Connector
    connectorTracker.trackAddToCart(product, quantity, currentUser?.customer_id);
    showToast('Added to Cart', 'success', `${product.product_name} (${quantity}x) added to cart.`);
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
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    const cartVal = cartItems.reduce((acc, item) => acc + item.product.final_price * item.quantity, 0) + (product.final_price * quantity);
    connectorTracker.trackCheckoutStarted(cartVal, cartItems.length + 1);
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

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = p.final_price <= maxPrice;
    return matchesCategory && matchesSearch && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.final_price - b.final_price;
    if (sortBy === 'price-high') return b.final_price - a.final_price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'popularity') return b.review_count - a.review_count;
    return 0;
  });

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalValue = cartItems.reduce((acc, item) => acc + (item.product.final_price * item.quantity), 0);

  const handleSearchInputChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 2) {
      const matchCount = products.filter((p) =>
        p.product_name.toLowerCase().includes(q.toLowerCase()) ||
        p.category.toLowerCase().includes(q.toLowerCase())
      ).length;
      connectorTracker.trackSearch(q, matchCount);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navbar */}
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => {
          setIsCartOpen(true);
          connectorTracker.trackCartView(cartTotalValue, cartTotalCount);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          connectorTracker.sendEvent('CATEGORY_VIEW', { category: cat });
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearchInputChange}
        onNavigateHome={() => {
          setSelectedCategory('All');
          setSearchQuery('');
          connectorTracker.trackPageView('Home');
        }}
        onNavigateOrders={() => setIsOrdersOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {selectedCategory === 'All' && searchQuery === '' && (
          <HeroBanner
            onShopNow={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              connectorTracker.sendEvent('CATEGORY_VIEW', { category: cat });
            }}
          />
        )}

        {/* Product Catalog Section */}
        <div id="catalog-section" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {selectedCategory === 'All' ? 'All Products Catalog' : `${selectedCategory} Collection`}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {sortedProducts.length} of {products.length} products
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 font-semibold">Max: ₹{maxPrice}</span>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="250"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24 accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="relative flex items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
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

              {(selectedCategory !== 'All' || searchQuery !== '' || maxPrice < 5000 || sortBy !== 'featured') && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setMaxPrice(5000);
                    setSortBy('featured');
                  }}
                  className="p-2 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl transition"
                  title="Reset Filters"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          {sortedProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 stroke-[1.5] mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-500">Try adjusting your search query, price slider, or category filter.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setMaxPrice(5000);
                }}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map((prod) => (
                <ProductCard
                  key={prod.product_id}
                  product={prod}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onSelectProduct={handleOpenProductDetails}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Modals & Drawers */}
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

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
          connectorTracker.trackCheckoutStarted(cartTotalValue, cartTotalCount);
        }}
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
