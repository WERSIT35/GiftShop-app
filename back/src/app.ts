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

/* ===========================
   🔥 CRITICAL FIX #1
   Trust reverse proxy (NGINX)
=========================== */
app.set("trust proxy", 1);

/* ===========================
   Security headers
=========================== */
app.use(helmet());

/* ===========================
   Logging
=========================== */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ===========================
   CORS (MUST be before rate-limit)
=========================== */
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost";

const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost",
  "http://127.0.0.1",
  "http://192.168.0.19", // 🔥 your LAN IP
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow curl / mobile apps / SSR
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`🚫 CORS blocked: ${origin}`);
      return callback(new Error("CORS policy: This origin is not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===========================
   Rate limiter (AFTER CORS)
=========================== */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

/* ===========================
   Body parsers
=========================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ===========================
   Cookies
=========================== */
app.use(cookieParser());

/* ===========================
   Health / Root
=========================== */
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🎁 GiftShop API — up and running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* ===========================
   API routes
=========================== */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);

/* ===========================
   404 handler
=========================== */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  });
});

/* ===========================
   Global error handler
=========================== */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Unhandled error:", err);

  res.status(err.status || 500).json({
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      timestamp: new Date().toISOString(),
    },
  });
});

export default app;
