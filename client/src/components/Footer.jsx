import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">EcoStore 🌱</h3>
            <p>Sustainable products for a better planet.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul>
              <li><Link to="/" className="hover:text-green-400">Home</Link></li>
              <li><Link to="/shop" className="hover:text-green-400">Shop</Link></li>
              <li><Link to="/about" className="hover:text-green-400">About</Link></li>
              <li><Link to="/contact" className="hover:text-green-400">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul>
              <li>Accessories</li>
              <li>Clothing</li>
              <li>Personal Care</li>
              <li>Stationery</li>
              <li>Electronics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-400">Facebook</a>
              <a href="#" className="hover:text-green-400">Twitter</a>
              <a href="#" className="hover:text-green-400">Instagram</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; 2026 EcoStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;