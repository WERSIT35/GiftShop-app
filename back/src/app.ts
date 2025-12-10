// app.ts
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

// --- Security headers ---
app.use(helmet());

// --- Logging (useful in dev) ---
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- Rate limiter (basic) ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api", apiLimiter);

// --- CORS ---
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200";
const allowedOrigins = [
  FRONTEND_URL,
  FRONTEND_URL.replace(/\/$/, ""), // Remove trailing slash if present
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "http://localhost:80",  // For Docker production
  "http://localhost:3000" // For React dev server
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        return callback(null, true);
      }
      
      // In development, allow all origins for debugging
      if (process.env.NODE_ENV !== "production") {
        console.log(`🌐 Allowing origin in dev: ${origin}`);
        return callback(null, true);
      }
      
      console.warn(`🚫 CORS blocked: ${origin} not in allowed list`);
      return callback(new Error("CORS policy: This origin is not allowed"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// --- Built-in parsers ---
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Cookies ---
app.use(cookieParser());

// --- Health / root ---
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🎁 GiftShop API — up and running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/env-check", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    mongodb: {
      connected: false, // This would need to be checked from mongoose
      uriConfigured: !!process.env.MONGO_URI || !!process.env.MONGODB_URI
    },
    cors: {
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:4200",
      allowedOrigins: allowedOrigins
    }
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);

// --- 404 handler for unknown routes ---
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// --- Centralized error handler ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Unhandled error:", err);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "Internal server error";

  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
      timestamp: new Date().toISOString()
    }
  });
});

export default app;