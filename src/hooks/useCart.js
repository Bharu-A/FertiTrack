// src/hooks/useCart.js
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useCart() {
  const [cart, setCart] = useState([]);
  const { userData } = useContext(AuthContext);

  const addToCart = (fertilizer) => {
    if (userData?.role !== 'farmer') return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === fertilizer.id);
      if (existing) {
        return prev.map(item =>
          item.id === fertilizer.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...fertilizer, quantity: 1 }];
    });
  };

  const removeFromCart = (fertilizerId) => {
    setCart(prev => prev.filter(item => item.id !== fertilizerId));
  };

  const updateQuantity = (fertilizerId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(fertilizerId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === fertilizerId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice
  };
}