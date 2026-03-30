import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import PageParallax from './components/PageParallax';
import { Toaster } from 'react-hot-toast';
// import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
            <Navbar />
            <Routes>
              <Route path="/" element={<PageParallax><Home /></PageParallax>} />
              <Route path="/shop" element={<PageParallax><Shop /></PageParallax>} />
              <Route path="/product/:id" element={<PageParallax><ProductDetails /></PageParallax>} />
              <Route path="/cart" element={<PageParallax><Cart /></PageParallax>} />
              <Route path="/wishlist" element={<PageParallax><Wishlist /></PageParallax>} />
              <Route path="/about" element={<PageParallax><About /></PageParallax>} />
              <Route path="/contact" element={<PageParallax><Contact /></PageParallax>} />
              <Route path="/login" element={<PageParallax><Login /></PageParallax>} />
              <Route path="/signup" element={<PageParallax><Signup /></PageParallax>} />
              <Route path="/profile" element={<PageParallax><Profile /></PageParallax>} />
              <Route path="/orders" element={<PageParallax><Orders /></PageParallax>} />
              <Route path="/settings" element={<PageParallax><Settings /></PageParallax>} />
            </Routes>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;