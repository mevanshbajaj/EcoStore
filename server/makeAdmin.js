require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecostore')
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { returnDocument: 'after' }
    );

    if (!user) {
      console.error(`✗ No user found with email: ${email}`);
      console.log('\nRegistered users in the database:');
      const users = await User.find({}, 'name email role').lean();
      if (users.length === 0) {
        console.log('  (none — sign up in the app first, then run this script)');
      } else {
        users.forEach(u => console.log(`  • ${u.email}  [${u.role}]  — ${u.name}`));
      }
      process.exit(1);
    }

    console.log(`✓ ${user.name} (${user.email}) is now an admin.`);
    console.log('  Log out and back in for the change to take effect.');
    process.exit(0);
  })
  .catch(err => {
    console.error('DB error:', err.message);
    process.exit(1);
  });
