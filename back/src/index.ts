// index.ts - FIXED
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// === 1. LOAD ENVIRONMENT FIRST ===
console.log("=== Loading Environment ===");
console.log("Current directory:", __dirname);

// Try to load from back/.env first
const backEnvPath = path.join(__dirname, ".env");
const rootEnvPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(backEnvPath)) {
  console.log("📁 Loading from: back/.env");
  dotenv.config({ path: backEnvPath });
} else if (fs.existsSync(rootEnvPath)) {
  console.log("📁 Loading from: root/.env");
  dotenv.config({ path: rootEnvPath });
} else {
  console.warn("⚠️  No .env file found!");
}

// DEBUG: Show what was loaded
console.log("\n✅ Environment loaded:");
console.log("- NODE_ENV:", process.env.NODE_ENV || "development");
console.log("- PORT:", process.env.PORT || 5000);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "✓" : "✗");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✓" : "✗");

// === 2. IMPORT AFTER ENV IS LOADED ===
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("\n=== Starting Server ===");
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();