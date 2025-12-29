import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export interface AuthRequest extends Request {
  userId?: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No authorization header" });

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Invalid authorization format" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.userId = payload.id;

    // Activity + IP tracking for authenticated users
    try {
      const forwarded = req.headers["x-forwarded-for"];
      const forwardedIp = Array.isArray(forwarded)
        ? forwarded[0]
        : typeof forwarded === "string"
          ? forwarded.split(",")[0]?.trim()
          : null;

      const ip = forwardedIp || req.ip || null;
      if (req.userId) {
        const update: any = { $set: { lastSeenAt: new Date() } };

        if (ip) {
          update.$set.lastIp = ip;
          update.$addToSet = { ipAddresses: ip };
        }

        await User.findByIdAndUpdate(req.userId, update, { new: false }).exec();
      }
    } catch {
      // ignore tracking errors
    }

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to check for admin role
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) return res.status(401).json({ message: "Not authenticated" });
  const user = await User.findById(req.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
