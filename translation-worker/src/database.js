const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Worker: MongoDB connected successfully.');
  } catch (err) {
    console.error('Worker: MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };