import React, { useState } from 'react';
import { ShoppingBag, Search, User as UserIcon, LogOut, Package, Info, X, ChevronDown, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onOpenProjectInfo: () => void;
}

const CATEGORIES = [
  'All',
  'Workspace & Tech',
  'Everyday Carry',
  'Home & Living',
  'Kitchen & Brew',
  'Wellness & Rest',
];

export const Navbar: React.FC<NavbarProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAuth,
  onOpenOrders,
  onOpenProjectInfo,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top Announcement Bar */}
      <div className="bg-neutral-900 text-neutral-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold">★</span>
            <span className="font-medium text-neutral-100">Complimentary expedited shipping on orders over $75</span>
            <span className="hidden sm:inline text-neutral-400">· Curated quality guaranteed</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-300">
            <button
              id="nav-project-architecture-btn"
              onClick={onOpenProjectInfo}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors cursor-pointer text-xs font-medium"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Portfolio Tech Stack:</span> SQLite + Node.js API
            </button>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Currency: USD ($)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => {
                onSelectCategory('All');
                onSearchChange('');
              }}
              className="text-left group flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center font-extrabold text-xl shadow-sm tracking-tighter group-hover:scale-105 transition-transform duration-200">
                A
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-neutral-900 font-['Space_Grotesk']">
                    ANSH CART
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200/60">
                    Curated
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 hidden sm:block tracking-wide">
                  Everyday tools & modern essentials
                </p>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <input
                id="search-input-desktop"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search mechanical keyboards, leather folios, kettles..."
                className="w-full bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-neutral-900 pl-10 pr-10 py-2.5 rounded-full text-sm border border-neutral-200/80 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 transition-all placeholder:text-neutral-400"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-3 p-0.5 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-200/70"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Account / Auth */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    id="user-menu-trigger-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 transition-colors border border-neutral-200/60 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-neutral-900 font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 hidden lg:inline max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      id="user-dropdown-menu"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    >
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs font-medium text-neutral-500">Signed in as</p>
                        <p className="text-sm font-semibold text-neutral-900 truncate">{user.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                      </div>
                      <button
                        id="user-menu-orders-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenOrders();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer font-medium"
                      >
                        <Package className="w-4 h-4 text-neutral-500" />
                        My Orders & Receipts
                      </button>
                      <button
                        id="user-menu-signout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium border-t border-neutral-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="nav-signin-btn"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-neutral-500" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Cart Button */}
            <button
              id="open-cart-drawer-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-transform active:scale-95 cursor-pointer shadow-sm"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-amber-400 text-neutral-950 font-bold px-1.5 py-0.2 rounded-full text-[11px] min-w-[20px] text-center">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              id="search-input-mobile"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-neutral-100 text-neutral-900 pl-9 pr-8 py-2 rounded-lg text-sm border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
            {searchQuery && (
              <button
                id="clear-mobile-search-btn"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar border-t border-neutral-100 text-xs">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-nav-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
