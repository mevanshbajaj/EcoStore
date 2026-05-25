require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

const coupons = [
  { code: 'ECO10', discountType: 'percent', discountValue: 10, minOrderAmount: 200, maxUses: 500 },
  { code: 'ECO50', discountType: 'flat', discountValue: 50, minOrderAmount: 300, maxUses: 200 },
  { code: 'GREEN20', discountType: 'percent', discountValue: 20, minOrderAmount: 500, maxUses: 100 },
  { code: 'WELCOME', discountType: 'flat', discountValue: 100, minOrderAmount: 499, maxUses: 1000 },
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecostore')
  .then(async () => {
    await Coupon.deleteMany({});
    await Coupon.insertMany(coupons);
    console.log('Coupons seeded:', coupons.map(c => c.code).join(', '));
    process.exit(0);
  })
  .catch(err => { console.error(err); process.exit(1); });
