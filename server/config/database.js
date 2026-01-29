import mongoose from 'mongoose';

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/justcoding";
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.warn("MongoDB connection warning:", error.message);
    console.log("⚠️  Running in fallback mode without database persistence");
  }
};

export default connectDB;
