const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/diamond-house-cleaning');
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: 'admin@diamondhousecleaning.com' },
      { role: 'admin' },
      { new: true }
    );

    if (user) {
      console.log('User promoted to admin:', user.email);
    } else {
      console.log('User not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();