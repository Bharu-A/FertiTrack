import React from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { createOrder } from '../utils/orderUtils';
import toast from 'react-hot-toast';

export function Cart({ onClose }) {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { currentUser, userData } = useAuth();

  const handlePlaceOrder = async () => {
    try {
      await createOrder(cart, currentUser.uid, userData);
      clearCart();
      toast.success('Order placed successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to place order: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50">
      <div className="backdrop-blur-lg bg-white/10 border-l border-white/20 w-full max-w-md h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="text-white" size={24} />
              <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="text-white/40 mx-auto mb-4" />
              <p className="text-white/80 text-lg">Your cart is empty</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">{item.name}</h3>
                      <p className="text-emerald-300 text-sm">${item.price}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <Minus size={14} className="text-white" />
                        </button>
                        <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <Plus size={14} className="text-white" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-300 hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total and Checkout */}
              <div className="border-t border-white/20 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-white/80 text-lg">Total:</span>
                  <span className="text-white text-2xl font-bold">${getTotalPrice().toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}