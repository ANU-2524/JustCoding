const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/justcoding';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.log('⚠️ MongoDB unavailable - using fallback mode');
    // Don't exit process, allow app to run without DB
  }
};

module.exports = connectDB;