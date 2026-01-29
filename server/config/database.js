import mongoose from 'mongoose';
import { logger } from '../services/logger.js';

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/justcoding";
  
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("MongoDB connected ✅");
  } catch (error) {
    logger.warn("MongoDB connection warning", { error: error.message });
    logger.warn("⚠️  Running in fallback mode without database persistence");
  }
};

export default connectDB;
