import { useEffect, useState, useContext } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaStar, FaHeart, FaShoppingCart, FaLeaf, FaRecycle, FaTree } from 'react-icons/fa';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const floatingY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -260]), {
    stiffness: 80,
    damping: 24,
  });

  useEffect(() => {
    const queryFromUrl = searchParams.get('search');
    if (queryFromUrl) {
      setSearchTerm(queryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:5002/api/products'),
          fetch('http://localhost:5002/api/categories')
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = (product.rating || 4.5) >= minRating;
      return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const clearFilters = () => {
    setSelectedCategory('');
    setSortBy('name');
    setPriceRange([0, 10000]);
    setMinRating(0);
    setSearchTerm('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const toggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full shadow-lg"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <motion.div
        style={{ y: bgY }}
        className="absolute -top-28 -left-20 w-80 h-80 rounded-full bg-green-300/20 blur-3xl"
      />
      <motion.div
        style={{ y: floatingY }}
        className="absolute top-1/3 -right-16 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl"
      />
      <motion.div
        style={{ y: bgY }}
        className="absolute bottom-10 left-1/3 w-72 h-72 rounded-full bg-purple-300/20 blur-3xl"
      />

      {/* Hero Section with Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="relative h-96 overflow-hidden bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <FaLeaf className="text-6xl text-green-300" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              EcoStore Shop
            </h1>
            <p className="text-xl md:text-2xl text-green-100 mb-8">
              Discover sustainable products for a better tomorrow
            </p>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center space-x-8 text-green-200"
            >
              <div className="flex items-center space-x-2">
                <FaRecycle className="text-2xl" />
                <span className="text-lg">Eco-Friendly</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaTree className="text-2xl" />
                <span className="text-lg">Sustainable</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-20 text-green-300/30"
        >
          <FaLeaf className="text-4xl" />
        </motion.div>
        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-20 text-blue-300/30"
        >
          <FaRecycle className="text-3xl" />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-12 border border-white/20"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative flex-1 w-full lg:w-auto"
            >
              <FaSearch className="absolute left-4 top-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search eco-friendly products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-lg bg-gray-50/50"
              />
            </motion.div>

            {/* Category Filter */}
            <motion.select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </motion.select>

            {/* Sort */}
            <motion.select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm"
              whileHover={{ scale: 1.02 }}
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </motion.select>

            {/* Advanced Filters Toggle */}
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter />
              <span className="font-semibold">Filters</span>
            </motion.button>
            <button
              onClick={clearFilters}
              className="px-5 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Clear
            </button>
          </div>

          {/* Advanced Filters */}
          <motion.div
            initial={false}
            animate={{
              height: showFilters ? 'auto' : 0,
              opacity: showFilters ? 1 : 0
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="mt-8 pt-8 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Price Range */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-100"
                >
                  <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">₹</span>
                    </span>
                    Price Range
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-28 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                    <span className="text-gray-500 font-semibold">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-28 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    />
                  </div>
                </motion.div>

                {/* Rating Filter */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-100"
                >
                  <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaStar className="text-yellow-500 mr-3 text-xl" />
                    Minimum Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => setMinRating(star === minRating ? 0 : star)}
                        whileHover={{ scale: 1.2 }}
                        className="cursor-pointer"
                      >
                        <FaStar
                          className={`text-2xl transition-colors ${
                            star <= minRating ? 'text-yellow-500' : 'text-yellow-300 hover:text-yellow-500'
                          }`}
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Total Products: <span className="font-semibold text-purple-600">{products.length}</span></p>
                    <p>Filtered Results: <span className="font-semibold text-purple-600">{filteredAndSortedProducts.length}</span></p>
                    <p>Categories: <span className="font-semibold text-purple-600">{categories.length}</span></p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 flex items-center justify-between gap-4 flex-wrap"
        >
          <p className="text-gray-600">
            Showing {filteredAndSortedProducts.length} of {products.length} products
          </p>
          {minRating > 0 && (
            <p className="text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full border border-gray-200">
              Min rating: {minRating}+
            </p>
          )}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredAndSortedProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden group border border-gray-100 transition-all duration-500"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Eco-Friendly
                </div>
                <motion.button
                  onClick={(e) => toggleWishlist(e, product)}
                  className="absolute top-3 left-3 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaHeart
                    className={`text-xl transition-colors duration-300 ${
                      isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'
                    }`}
                  />
                </motion.button>

                {/* Overlay with quick actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <motion.button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold shadow-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaShoppingCart className="text-sm" />
                    Add to Cart
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
                    {product.name}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      ₹{product.price}
                    </span>
                    <span className="text-xs text-gray-500">Inclusive of all taxes</span>
                  </div>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span className="text-sm font-semibold text-gray-700">{product.rating || 4.5}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/product/${product.id}`}
                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-4 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold text-center shadow-sm hover:shadow-md"
                  >
                    View Details
                  </Link>
                  <motion.button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaShoppingCart />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredAndSortedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mt-14 mb-8 rounded-3xl bg-white/80 backdrop-blur-md border border-white/60 shadow-xl p-8 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Shop Smarter, Live Greener</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use filters to quickly find sustainable picks by category, budget, and rating. Every choice here supports a cleaner planet.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Shop;