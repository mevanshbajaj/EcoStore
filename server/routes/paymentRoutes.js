const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  applyCoupon,
  placeCODOrder,
} = require('../controllers/paymentController');

router.post('/coupon/apply', protect, applyCoupon);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/failed', protect, handlePaymentFailure);
router.post('/cod', protect, placeCODOrder);

module.exports = router;
