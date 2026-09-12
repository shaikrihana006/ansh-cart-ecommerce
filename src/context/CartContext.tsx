import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types.ts';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  discountPercent: number;
  discountAmount: number;
  tax: number;
  total: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ansh_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ansh_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.title}" to cart`);
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setDiscountPercent(0);
    localStorage.removeItem('ansh_cart_items');
  };

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'ANSH10') {
      setPromoCode('ANSH10');
      setDiscountPercent(10);
      return { success: true, message: 'Coupon applied! 10% discount added.' };
    }
    if (clean === 'CURATED15') {
      setPromoCode('CURATED15');
      setDiscountPercent(15);
      return { success: true, message: 'VIP Member discount applied! 15% off.' };
    }
    return { success: false, message: 'Invalid or expired promo code. Try "ANSH10"' };
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const freeShippingThreshold = 75;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal === 0 ? 0 : (subtotal >= freeShippingThreshold ? 0 : 9.00);

  const discountAmount = Math.round((subtotal * (discountPercent / 100)) * 100) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round((taxableSubtotal * 0.08) * 100) / 100;
  const total = Math.round((taxableSubtotal + shippingFee + tax) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        shippingFee,
        freeShippingThreshold,
        remainingForFreeShipping,
        discountPercent,
        discountAmount,
        tax,
        total,
        promoCode,
        applyPromoCode,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
