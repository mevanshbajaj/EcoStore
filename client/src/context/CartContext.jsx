import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchCart = useCallback(async () => {
    if (!user?.token) { setCart([]); return; }
    try {
      const data = await api.get('/api/cart');
      setCart(data);
    } catch {
      setCart([]);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!user?.token) { toast.error('Please login to add to cart'); return; }
    try {
      const updatedCart = await api.post('/api/cart/add', { productId: product.id || product._id, quantity });
      setCart(updatedCart);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart.');
    }
  };

  const removeFromCart = async (id) => {
    try {
      const updatedCart = await api.delete(`/api/cart/${id}`);
      setCart(updatedCart);
      toast.success('Item removed from cart.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove item.');
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      const updatedCart = await api.put('/api/cart/update', { productId: id, quantity });
      setCart(updatedCart);
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity.');
    }
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
