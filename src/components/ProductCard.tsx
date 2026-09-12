import React from 'react';
import { Star, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart, cart } = useCart();
  const inCart = cart.some((item) => item.product.id === product.id);

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:border-neutral-300"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-neutral-900/90 text-white backdrop-blur-md shadow-xs">
              {product.badge}
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-neutral-950 shadow-xs">
              Save {discount}%
            </span>
          )}
        </div>

        {/* Stock pill */}
        {product.stock <= 15 && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-neutral-800 text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
            Only {product.stock} left
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5 text-neutral-500">
            <span className="font-medium tracking-wide uppercase text-[10px] text-neutral-400">
              {product.category}
            </span>
            <div className="flex items-center gap-1 font-semibold text-neutral-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-neutral-400 text-[11px]">({product.reviews_count})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-neutral-900 text-base group-hover:text-neutral-700 transition-colors line-clamp-1">
            {product.title}
          </h3>

          {/* Tagline / short desc */}
          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
            {product.tagline || product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-neutral-900 font-['Space_Grotesk']">
                ${product.price.toFixed(2)}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-neutral-400 line-through">
                  ${product.compare_at_price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={handleAddToCart}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
              inCart
                ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200'
                : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs'
            }`}
            title="Add to shopping cart"
          >
            {inCart ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
