const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
const PORT = 5002;

mongoose.connect('mongodb://127.0.0.1:27017/ecostore')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

let products = [
  {
    id: 1,
    name: 'Eco-friendly Water Bottle',
    price: 2000,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop',
    description: 'Reusable water bottle made from recycled materials.'
  },
  {
    id: 2,
    name: 'Organic Cotton T-shirt',
    price: 2400,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    description: 'Comfortable t-shirt made from 100% organic cotton.'
  },
  {
    id: 3,
    name: 'Bamboo Toothbrush',
    price: 400,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=300&h=300&fit=crop',
    description: 'Biodegradable toothbrush made from bamboo.'
  },
  {
    id: 4,
    name: 'Recycled Paper Notebook',
    price: 800,
    category: 'Stationery',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop',
    description: 'Notebook made from 100% recycled paper.'
  },
  {
    id: 5,
    name: 'Solar Powered Charger',
    price: 4000,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop',
    description: 'Portable solar charger for your devices.'
  },
  {
    id: 6,
    name: 'Plant-based Shampoo',
    price: 1200,
    category: 'Personal Care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
    description: 'Natural shampoo made from plant extracts.'
  }
];

let cart = [];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json(categories);
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id == productId);
  if (product) {
    const existing = cart.find(item => item.id == productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.get('/api/cart', (req, res) => {
  res.json(cart);
});

app.delete('/api/cart/:id', (req, res) => {
  cart = cart.filter(item => item.id != req.params.id);
  res.json(cart);
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    res.json({ message: 'Signup successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed. Server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Server error.' });
  }
});

app.put('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  const item = cart.find(item => item.id == productId);
  if (item) {
    item.quantity = quantity;
    res.json(cart);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});