import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { OrderHistoryModal } from './components/OrderHistoryModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProjectInfoModal } from './components/ProjectInfoModal.tsx';
import { Footer } from './components/Footer.tsx';
import { fetchProducts, fetchProductByIdOrSlug } from './api.ts';
import { Product, Order } from './types.ts';
import { SlidersHorizontal, ArrowUpDown, Sparkles, AlertCircle, RefreshCw, Check } from 'lucide-react';

function StorefrontContent() {
  const { toastMessage, setIsCartOpen } = useCart();
  const { user } = useAuth();

  // Filters & State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('featured');
  const [selectedBadge, setSelectedBadge] = useState<string>('All');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Load products whenever category, search, sort, or badge changes
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchProducts({
          category: activeCategory,
          search: searchQuery,
          sort: selectedSort,
          badge: selectedBadge !== 'All' ? selectedBadge : undefined,
        });
        if (isMounted) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Failed to load products from SQLite:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      load();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeCategory, searchQuery, selectedSort, selectedBadge]);

  const handleOpenProduct = async (prod: Product) => {
    try {
      const data = await fetchProductByIdOrSlug(prod.id);
      setSelectedProduct(data.product);
      setRelatedProducts(data.related || []);
    } catch {
      setSelectedProduct(prod);
      setRelatedProducts([]);
    }
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
  };

  const featuredProduct = products.find((p) => p.is_featured === 1) || products[0];

  const BADGES = ['All', 'Best Seller', 'Staff Pick', 'Editor’s Choice', 'Trending'];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col selection:bg-amber-200 selection:text-neutral-950">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="cart-toast-banner"
          className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 text-xs font-medium max-w-sm"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="flex-1 truncate">{toastMessage}</span>
          <button
            id="toast-view-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="text-amber-400 font-bold hover:underline shrink-0 ml-2"
          >
            View Cart
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenProjectInfo={() => setIsProjectInfoOpen(true)}
      />

      {/* Curated Hero Section (visible if not deeply filtering) */}
      {!searchQuery && activeCategory === 'All' && (
        <HeroBanner
          featuredProduct={featuredProduct}
          onExploreClick={() => {
            const el = document.getElementById('catalog-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onProductClick={handleOpenProduct}
        />
      )}

      {/* Main Catalog Section */}
      <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Section Header & Filters Toolbar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SQLite-Powered Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-['Space_Grotesk']">
              {activeCategory === 'All' ? 'Curated Catalog' : activeCategory}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Showing {products.length} handpicked item{products.length === 1 ? '' : 's'} engineered for everyday utility.
            </p>
          </div>

          {/* Filter / Sort Controls */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Badge Filter Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
              {BADGES.map((b) => (
                <button
                  key={b}
                  id={`badge-filter-${b.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setSelectedBadge(b)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedBadge === b
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                id="catalog-sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-white text-neutral-900 pl-3 pr-8 py-2 rounded-xl text-xs font-semibold border border-neutral-200 focus:outline-none focus:border-neutral-400 cursor-pointer shadow-xs"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Additions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(activeCategory !== 'All' || searchQuery || selectedBadge !== 'All') && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="text-xs text-neutral-400 font-medium">Active Filters:</span>
            {activeCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-200/80 text-neutral-800 text-xs font-medium">
                Category: {activeCategory}
                <button
                  onClick={() => setActiveCategory('All')}
                  className="hover:text-red-600 ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {selectedBadge !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-200/80 text-neutral-800 text-xs font-medium">
                Badge: {selectedBadge}
                <button
                  onClick={() => setSelectedBadge('All')}
                  className="hover:text-red-600 ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-200/80 text-neutral-800 text-xs font-medium">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-600 ml-1 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            <button
              id="reset-all-filters-btn"
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
                setSelectedBadge('All');
              }}
              className="text-xs text-amber-700 hover:text-amber-800 font-semibold underline ml-2 cursor-pointer"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Product Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-neutral-200 space-y-3 animate-pulse">
                  <div className="aspect-4/3 bg-neutral-200 rounded-xl" />
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                  <div className="h-3 bg-neutral-200 rounded w-full" />
                  <div className="h-6 bg-neutral-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200 p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 font-['Space_Grotesk']">
                No matching items found
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                We couldn't find any products matching your search criteria in the SQLite database. Try clearing your filters or search for another keyword.
              </p>
              <button
                id="empty-reset-filters-btn"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  setSelectedBadge('All');
                }}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Clear Search & View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onClick={() => handleOpenProduct(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals & Overlays */}
      <ProductDetailModal
        product={selectedProduct}
        relatedProducts={relatedProducts}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={handleOpenProduct}
        onInstantCheckout={() => setIsCheckoutOpen(true)}
      />

      <CartDrawer
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => setIsOrdersOpen(true)}
      />

      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ProjectInfoModal
        isOpen={isProjectInfoOpen}
        onClose={() => setIsProjectInfoOpen(false)}
      />

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenProjectInfo={() => setIsProjectInfoOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StorefrontContent />
      </CartProvider>
    </AuthProvider>
  );
}
