import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';
import { Product } from '../types.ts';

interface HeroBannerProps {
  featuredProduct?: Product;
  onExploreClick: () => void;
  onProductClick: (p: Product) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredProduct,
  onExploreClick,
  onProductClick,
}) => {
  return (
    <section className="relative overflow-hidden bg-neutral-900 text-white rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-6 border border-neutral-800 shadow-xl">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,119,6,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:px-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* Left copy */}
        <div className="max-w-2xl text-left space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/90 border border-neutral-700 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curated Edition 2026</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-300">Modern Everyday Tools</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-[1.1]">
            Curated essentials for thoughtful living.
          </h1>

          <p className="text-neutral-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
            ANSH CART brings together handpicked tactile workspace tools, artisanal kitchen brew gear, and timeless daily carry crafted to outlast trends.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-explore-collection-btn"
              onClick={onExploreClick}
              className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-amber-400/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {featuredProduct && (
              <button
                id="hero-spotlight-item-btn"
                onClick={() => onProductClick(featuredProduct)}
                className="px-5 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Featured: {featuredProduct.title.split(' ')[0]} {featuredProduct.title.split(' ')[1]}
              </button>
            )}
          </div>

          {/* Value propositions */}
          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-neutral-800/80 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Free expedited shipping over $75</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Full warranty on all items</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
              <span>30-Day risk-free returns</span>
            </div>
          </div>
        </div>

        {/* Right Product Spotlight card */}
        {featuredProduct && (
          <div
            id="hero-featured-spotlight-card"
            onClick={() => onProductClick(featuredProduct)}
            className="w-full lg:max-w-md bg-neutral-800/80 hover:bg-neutral-800 backdrop-blur-sm border border-neutral-700/80 rounded-2xl p-5 cursor-pointer group transition-all duration-300 hover:border-amber-400/50 shadow-2xl"
          >
            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-neutral-900 mb-4">
              <img
                src={featuredProduct.image}
                alt={featuredProduct.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-neutral-700">
                ★ Staff Spotlight
              </div>
              <div className="absolute bottom-3 right-3 bg-neutral-900/90 backdrop-blur-md text-white font-bold text-sm px-3 py-1 rounded-full">
                ${featuredProduct.price.toFixed(2)}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-amber-400/90 font-medium">
                <span>{featuredProduct.category}</span>
                <span>★ {featuredProduct.rating} ({featuredProduct.reviews_count} reviews)</span>
              </div>
              <h3 className="font-bold text-white text-lg group-hover:text-amber-300 transition-colors line-clamp-1">
                {featuredProduct.title}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2">
                {featuredProduct.tagline || featuredProduct.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
