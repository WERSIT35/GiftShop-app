// config/db.ts - FIXED
import mongoose from "mongoose";

const connectDB = async (): Promise<typeof mongoose> => {
  try {
    console.log("\n=== MongoDB Connection ===");
    
    // Check ALL possible environment variables
    const possibleUris = [
      process.env.MONGO_URI,
      process.env.MONGODB_URI,
      process.env.DATABASE_URL,
      "mongodb://localhost:27017/giftshop"  // Fallback
    ];
    
    // Find first non-empty URI
    const mongoUri = possibleUris.find(uri => uri && uri.trim() !== "");
    
    if (!mongoUri) {
      console.error("❌ ERROR: No MongoDB connection string found!");
      console.error("Please add to your .env file:");
      console.error("MONGO_URI=mongodb://localhost:27017/giftshop");
      throw new Error("MongoDB URI not configured");
    }
    
    // Hide password in logs
    const cleanUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@');
    console.log(`🔗 Connecting to: ${cleanUri}`);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log(`✅ Connected successfully!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error: any) {
    console.error("\n❌ MongoDB Connection Failed!");
    console.error(`Error: ${error.message}`);
    
    if (error.name === 'MongoServerSelectionError' || error.message.includes('ECONNREFUSED')) {
      console.error("\n💡 MONGODB IS NOT RUNNING!");
      console.error("Start it with one of these:");
      console.error("1. Open NEW Command Prompt and run:");
      console.error("   docker run -d -p 27017:27017 --name mongodb mongo:latest");
      console.error("2. If you have MongoDB installed:");
      console.error("   mongod");
      console.error("\n💡 Quick test: Can you connect with MongoDB Compass?");
    }
    
    process.exit(1);
  }
};

export default connectDB;