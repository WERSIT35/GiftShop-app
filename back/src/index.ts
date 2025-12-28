// index.ts
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// ================================
// 1️⃣ LOAD ENVIRONMENT FIRST
// ================================
console.log("=== Loading Environment ===");
console.log("Current directory:", __dirname);

// Env files in priority order
const ENV_FILES = [".env.local", ".env.docker", ".env"];


// Where to search (dist/ and back/)
const SEARCH_PATHS = [
  __dirname,                 // dist/
  path.join(__dirname, "..") // back/
];

let envLoaded = false;

for (const dir of SEARCH_PATHS) {
  for (const file of ENV_FILES) {
    const fullPath = path.join(dir, file);
    if (fs.existsSync(fullPath)) {
      console.log(`📁 Loading env from: ${fullPath}`);
      dotenv.config({ path: fullPath });
      envLoaded = true;
      break;
    }
  }
  if (envLoaded) break;
}

if (!envLoaded) {
  console.warn("⚠️  No environment file found!");
}

// ================================
// DEBUG OUTPUT (SAFE)
// ================================
console.log("\n✅ Environment loaded:");
console.log("- NODE_ENV:", process.env.NODE_ENV || "development");
console.log("- PORT:", process.env.PORT || 5000);
console.log("- MONGO_URI:", process.env.MONGO_URI ? "✓" : "✗");
console.log("- FRONTEND_URL:", process.env.FRONTEND_URL || "✗");

// ================================
// 2️⃣ IMPORT AFTER ENV IS READY
// ================================
import app from "./app";
import connectDB from "./config/db";

// Super user creation
import User from "./models/User";

async function ensureSuperUser() {
  const email = process.env.SUPERUSER_EMAIL;
  const password = process.env.SUPERUSER_PASSWORD;

  // ✅ Narrow env string -> "user" | "admin"
  const role: "user" | "admin" =
    process.env.SUPERUSER_ROLE === "user" || process.env.SUPERUSER_ROLE === "admin"
      ? process.env.SUPERUSER_ROLE
      : "admin";

  if (!email || !password) {
    console.warn("No SUPERUSER_EMAIL or SUPERUSER_PASSWORD in env, skipping super user creation.");
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== role) {
      existing.role = role; // ✅ now matches type
      await existing.save();
      console.log(`Super user role updated for ${email}`);
    } else {
      console.log("Super user already exists.");
    }
    return;
  }

  const user = new User({
    email,
    password,
    name: "Super Admin",
    role, // ✅ now matches type
    isEmailVerified: true,
  });

  await user.save();
  console.log(`Super user created: ${email}`);
}

const PORT = Number(process.env.PORT) || 5000;

// ================================
// 3️⃣ START SERVER
// ================================
const startServer = async () => {
  try {
    console.log("\n=== Starting Server ===");
    await connectDB();

    // Ensure super user exists
    await ensureSuperUser();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
