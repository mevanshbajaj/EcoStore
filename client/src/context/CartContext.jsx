import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Load cart from API
    fetch('http://localhost:5002/api/cart')
      .then(res => res.json())
      .then(data => setCart(data))
      .catch(() => setCart([]));
  }, []);

  const addToCart = async (product, quantity) => {
    const response = await fetch('http://localhost:5002/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity }),
    });
    const updatedCart = await response.json();
    setCart(updatedCart);
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = async (id) => {
    const response = await fetch(`http://localhost:5002/api/cart/${id}`, {
      method: 'DELETE',
    });
    const updatedCart = await response.json();
    setCart(updatedCart);
    toast.success('Item removed from cart');
  };

  const updateQuantity = async (id, quantity) => {
    const response = await fetch('http://localhost:5002/api/cart/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, quantity }),
    });
    const updatedCart = await response.json();
    setCart(updatedCart);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};