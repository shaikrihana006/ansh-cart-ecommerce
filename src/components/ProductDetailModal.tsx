import React, { useState } from 'react';
import { X, Star, Check, Truck, ShieldCheck, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  relatedProducts: Product[];
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
  onInstantCheckout: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  relatedProducts,
  onClose,
  onSelectProduct,
  onInstantCheckout,
}) => {
  if (!product) return null;

  const { addToCart, setIsCartOpen } = useCart();
  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Combine main image + secondary images
  const allImages = [product.image, ...(product.secondary_images || [])];

  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    onInstantCheckout();
  };

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="product-detail-modal-dialog"
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header Close button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>Shop</span>
            <span>/</span>
            <span className="font-semibold text-neutral-800">{product.category}</span>
          </div>
          <button
            id="close-product-detail-btn"
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 w-full bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200/80">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                  referrerPolicy="no-referrer"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-neutral-900 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImage === img
                          ? 'border-neutral-900 shadow-xs'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Purchase */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Title & Rating */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-neutral-800">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-neutral-400">
                      ({product.reviews_count} verified customer reviews)
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-['Space_Grotesk']">
                    {product.title}
                  </h2>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 py-2 border-y border-neutral-100">
                  <span className="text-3xl font-extrabold text-neutral-900 font-['Space_Grotesk']">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compare_at_price && (
                    <>
                      <span className="text-base text-neutral-400 line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Tagline & Description */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700 italic">
                    "{product.tagline}"
                  </p>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Feature Highlights */}
                {product.features && product.features.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Craftsmanship & Features
                    </h4>
                    <ul className="space-y-1.5 text-xs text-neutral-600">
                      {product.features.map((feat, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stock availability */}
                <div className="text-xs flex items-center gap-2 text-emerald-700 font-medium bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>In Stock ({product.stock} units ready to ship)</span>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-neutral-700">Quantity:</span>
                  <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-neutral-50">
                    <button
                      id="product-qty-decrement-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-200 font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold text-neutral-800 min-w-[36px] text-center">
                      {quantity}
                    </span>
                    <button
                      id="product-qty-increment-btn"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-200 font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="modal-add-to-cart-btn"
                    onClick={handleAddToCart}
                    className="py-3 px-4 rounded-xl font-bold text-sm bg-neutral-900 hover:bg-neutral-800 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                  >
                    {addedAnimation ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-amber-400" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    id="modal-buy-now-btn"
                    onClick={handleBuyNow}
                    className="py-3 px-4 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                  >
                    <span>Instant Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Assurance row */}
                <div className="grid grid-cols-3 gap-2 pt-3 text-[11px] text-neutral-500 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-neutral-700" />
                    <span>Free Shipping &gt;$75</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-neutral-700" />
                    <span>2-Year Warranty</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RefreshCw className="w-4 h-4 text-neutral-700" />
                    <span>30-Day Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Carousel/Row */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-neutral-200">
              <h3 className="text-base font-bold text-neutral-900 mb-4 font-['Space_Grotesk']">
                Complementary Curations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 4).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setSelectedImage(rel.image);
                      setQuantity(1);
                    }}
                    className="group bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer text-left"
                  >
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-neutral-200 mb-2">
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h4 className="text-xs font-semibold text-neutral-900 truncate group-hover:text-amber-700">
                      {rel.title}
                    </h4>
                    <p className="text-xs font-bold text-neutral-800 mt-1">
                      ${rel.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
