import { Request, Response } from "express";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";
import User from "../models/User.js";
import sendEmail from "../utils/mailer.js";

/* ======================
   JWT HELPERS
====================== */
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function isMsStringValue(val: string): boolean {
  // Accepts formats like '7d', '1h', '30m', '100s', etc.
  return /^[0-9]+(ms|s|m|h|d|w|y)$/.test(val);
}

function getJwtExpiresIn(): number | ms.StringValue {
  if (!JWT_EXPIRES_IN) return "7d";
  if (!isNaN(Number(JWT_EXPIRES_IN))) return Number(JWT_EXPIRES_IN);
  if (typeof JWT_EXPIRES_IN === "string" && isMsStringValue(JWT_EXPIRES_IN)) {
    return JWT_EXPIRES_IN as ms.StringValue;
  }
  return "7d";
}

const signToken = (userId: string) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  const expiresIn = getJwtExpiresIn();
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn });
};

/* ======================
   REGISTER
====================== */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password required",
      });
    }

    const existing = await User.findOne({ email }).exec();
    if (existing) {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      email,
      password,
      name,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyUrl = `${
      process.env.FRONTEND_URL
    }/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Verify your GiftShop account",
      html: `
        <p>Welcome to GiftShop 👋</p>
        <p>Please verify your email:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
      `,
    });

    return res.status(201).json({
      status: "success",
      message:
        "Registration successful. Please verify your email before signing in.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/* ======================
   LOGIN
====================== */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email }).select("+password").exec();

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        status: "error",
        message: "Please verify your email first",
      });
    }

    const token = signToken(user._id.toString());

    return res.json({
      status: "success",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name ?? null,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/* ======================
   VERIFY EMAIL
====================== */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        status: "error",
        message: "Invalid verification link",
      });
    }

    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Verification link invalid or expired",
      });
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    return res.json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

/* ======================
   FORGOT PASSWORD
====================== */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Do NOT reveal if email exists
      return res.json({
        message: "If this email exists, a reset link was sent",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



/* ======================
   RESET PASSWORD
====================== */

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // password will be hashed by pre-save hook
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
