import { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const normalizeId = (id) => String(id);

  useEffect(() => {
    // Load wishlist from localStorage for now (can be updated to use API later)
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        setWishlist(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setWishlist([]);
    }
  }, []);

  const addToWishlist = (product) => {
    setWishlist(prev => {
      const isAlreadyInWishlist = prev.some(item => normalizeId(item.id) === normalizeId(product.id));
      if (!isAlreadyInWishlist) {
        const newWishlist = [...prev, product];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
      }
      return prev;
    });
  };

  const removeFromWishlist = (id) => {
    setWishlist(prev => {
      const newWishlist = prev.filter(item => normalizeId(item.id) !== normalizeId(id));
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const isInWishlist = (id) => {
    return wishlist.some(item => normalizeId(item.id) === normalizeId(id));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};