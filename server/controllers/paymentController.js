const Razorpay = require('razorpay');
const crypto = require('crypto');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_COST = 50;
const DELIVERY_DAYS = 5;

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const calculatePricing = (items, discount = 0) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = parseFloat((discountedSubtotal * TAX_RATE).toFixed(2));
  const shipping = discountedSubtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = parseFloat((discountedSubtotal + tax + shipping).toFixed(2));
  return { subtotal, tax, shipping, total };
};

const validateAddress = (addr) => {
  return addr?.name && addr?.phone && addr?.addressLine1 && addr?.city && addr?.state && addr?.pincode;
};

// @desc    Apply coupon code
// @route   POST /api/payment/coupon/apply
// @access  Private
const applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required.' });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ message: 'Invalid or expired coupon code.' });

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit has been reached.' });
    }
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
      });
    }

    const rawDiscount = coupon.discountType === 'percent'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;

    const discount = parseFloat(Math.min(rawDiscount, subtotal).toFixed(2));

    res.json({ discount, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue });
  } catch (error) {
    console.error('applyCoupon error:', error);
    res.status(500).json({ message: 'Failed to apply coupon.' });
  }
};

// @desc    Create Razorpay order + save pending DB order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode, discount = 0 } = req.body;

    if (!validateAddress(shippingAddress)) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));

    const { subtotal, tax, shipping, total } = calculatePricing(items, discount);

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + DELIVERY_DAYS);

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      couponCode: couponCode || undefined,
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      estimatedDelivery,
    });

    res.json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment order.' });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, couponCode } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: 'Payment details are incomplete.' });
    }

    // HMAC-SHA256 signature verification
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed', status: 'cancelled' });
      return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'paid', status: 'processing', razorpayPaymentId, razorpaySignature },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Clear user's cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    res.json({ message: 'Payment verified.', orderId: order._id });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ message: 'Payment verification failed.' });
  }
};

// @desc    Mark payment as failed
// @route   POST /api/payment/failed
// @access  Private
const handlePaymentFailure = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed', status: 'cancelled' });
    }
    res.json({ message: 'Payment failure recorded.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record payment failure.' });
  }
};

// @desc    Place COD order
// @route   POST /api/payment/cod
// @access  Private
const placeCODOrder = async (req, res) => {
  try {
    const { shippingAddress, couponCode, discount = 0 } = req.body;

    if (!validateAddress(shippingAddress)) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));

    const { subtotal, tax, shipping, total } = calculatePricing(items, discount);

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + DELIVERY_DAYS);

    const order = await Order.create({
      user: req.user._id,
      items,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      couponCode: couponCode || undefined,
      shippingAddress,
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      estimatedDelivery,
    });

    cart.items = [];
    await cart.save();

    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    res.status(201).json({ orderId: order._id });
  } catch (error) {
    console.error('placeCODOrder error:', error);
    res.status(500).json({ message: 'Failed to place order.' });
  }
};

module.exports = { createRazorpayOrder, verifyPayment, handlePaymentFailure, applyCoupon, placeCODOrder };
