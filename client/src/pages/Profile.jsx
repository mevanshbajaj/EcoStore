import { motion } from 'framer-motion';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-green-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/40">
          <div className="h-32 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
          <div className="relative px-6 pb-8">
            <div className="flex justify-center -mt-16 mb-4">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full flex items-center justify-center text-5xl text-white font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.name || 'Jane Doe'}</h1>
              <p className="text-gray-500">{user?.email || 'jane@example.com'}</p>
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                🌱 Eco-Warrior Status: Bronze
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8 mt-8">
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">More Options Coming Soon</h3>
                <p className="text-gray-500">
                  Profile editing, avatar uploads, and address management will be available in Phase 2!
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
