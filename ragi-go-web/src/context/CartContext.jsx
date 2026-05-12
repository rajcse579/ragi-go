import React, { createContext, useState, useContext } from 'react';
import { hapticImpactLight } from '../utils/haptics';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('ragiGoCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // Save to localStorage whenever cart changes
  React.useEffect(() => {
    localStorage.setItem('ragiGoCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    if (item.available === false) return;
    hapticImpactLight();
    setCart((prev) => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter(i => i.id !== itemId));
  };

  const decreaseQuantity = (itemId) => {
    hapticImpactLight();
    setCart((prev) => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        if (existing.quantity > 1) {
          return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
        } else {
          return prev.filter(i => i.id !== itemId);
        }
      }
      return prev;
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount, decreaseQuantity }}>
      {children}
    </CartContext.Provider>
  );
};
