import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBoxOpen } from 'react-icons/fa';

const Orders = () => {
  return (
    <div className="min-h-screen bg-green-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/40 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
              <FaBoxOpen size={48} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Orders</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            You haven't placed any orders yet. Once you complete checkout, your order history will appear here.
            Stay tuned for Phase 2!
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Orders;
