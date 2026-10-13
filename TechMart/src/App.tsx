import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/layout/Toast';
import { CheckoutModal } from './components/checkout/CheckoutModal';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import type { TechMartProduct } from './types';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<TechMartProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const handleSelectProduct = (product: TechMartProduct) => {
    setSelectedProduct(product);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenCart={() => {
            setActiveTab('cart');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {activeTab === 'home' && (
            <HomePage
              setActiveTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogPage onSelectProduct={handleSelectProduct} />
          )}

          {activeTab === 'detail' && selectedProduct && (
            <ProductDetailPage
              product={selectedProduct}
              onBack={() => setActiveTab('catalog')}
              onOpenCheckout={() => setIsCheckoutOpen(true)}
            />
          )}

          {activeTab === 'cart' && (
            <CartPage
              onOpenCheckout={() => setIsCheckoutOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'wishlist' && (
            <WishlistPage
              onSelectProduct={handleSelectProduct}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'account' && <AccountPage />}

          {activeTab === 'admin' && <AdminDashboard />}
        </main>
      </div>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Global Toast */}
      <Toast />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;
