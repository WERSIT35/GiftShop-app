import type { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/mailer.js";

const JWT_SECRET: string = process.env.JWT_SECRET || "changeme";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200";

// ----------------- REGISTER -----------------
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: "error", 
        message: "Email and password are required." 
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ 
        status: "error", 
        message: "Email already registered." 
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    const user = await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires
    });

    const verifyUrl = `${FRONTEND_URL}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    const html = `
      <p>Hello ${name || ""},</p>
      <p>Thank you for registering at GiftShop. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>If the link doesn't work, copy-paste: ${verifyUrl}</p>
    `;

    console.log("📧 Attempting to send verification email...");
    const emailResult = await sendEmail(email, "Verify your GiftShop account", html);

    // Prepare response based on email success
    const response: any = {
      status: emailResult.success ? "success" : "partial",
      message: emailResult.success 
        ? "Registration successful. Check your email to verify." 
        : "Account created but verification email failed. Please contact support.",
      userId: user._id
    };

    // ⚠️ REMOVED: previewUrl check (new mailer.ts doesn't return previewUrl)
    // If you want test emails, update mailer.ts to return previewUrl
    
    // If email failed, include token for manual verification
    if (!emailResult.success) {
      response.verificationToken = verificationToken;
      response.manualVerifyUrl = `${FRONTEND_URL}/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      response.error = emailResult.error;
    }

    return res.status(201).json(response);
    
  } catch (err: any) {
    console.error("Register error:", err);
    return res.status(500).json({ 
      status: "error", 
      message: "Server error", 
      error: process.env.NODE_ENV === "development" ? err.message : undefined 
    });
  }
};

// ----------------- EMAIL VERIFICATION -----------------
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ 
        status: "error", 
        message: "Missing token or email" 
      });
    }

    const tokenStr = String(token);
    const emailStr = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: emailStr });

    if (!user) return res.status(404).json({ 
      status: "error", 
      message: "User not found" 
    });

    if (user.isVerified) {
      return res.json({ 
        status: "success", 
        message: "Email already verified", 
        alreadyVerified: true 
      });
    }

    if (user.verificationToken !== tokenStr) {
      return res.status(400).json({ 
        status: "error", 
        message: "Invalid token" 
      });
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return res.status(400).json({ 
        status: "error", 
        message: "Token expired" 
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.json({ 
      status: "success", 
      message: "Email verified successfully", 
      alreadyVerified: false 
    });
  } catch (err: any) {
    console.error("Verify error:", err);
    return res.status(500).json({ 
      status: "error", 
      message: "Server error" 
    });
  }
};

// ----------------- LOGIN -----------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: "error", 
        message: "Email and password are required" 
      });
    }

    const emailStr = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailStr });
    
    if (!user) return res.status(401).json({ 
      status: "error", 
      message: "Invalid credentials" 
    });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ 
      status: "error", 
      message: "Invalid credentials" 
    });

    if (!user.isVerified) return res.status(403).json({ 
      status: "error", 
      message: "Please verify your email first" 
    });

    const token = jwt.sign(
      { id: user._id }, 
      JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as any
    );

    return res.json({ 
      status: "success", 
      message: "Login successful", 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ 
      status: "error", 
      message: "Server error", 
      error: process.env.NODE_ENV === "development" ? err.message : undefined 
    });
  }
};