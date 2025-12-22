import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export interface AuthRequest extends Request {
  userId?: string;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No authorization header" });

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Invalid authorization format" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.userId = payload.id;
    next();
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
