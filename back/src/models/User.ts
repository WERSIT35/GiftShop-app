import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { computePinLookup, encryptPin } from "../utils/pin";

/* =========================
   USER INTERFACE
========================= */
export interface IUser extends Document {
  email: string;
  password?: string; // 🔑 optional (Google users)
  name: string | null;

  avatarUrl: string | null;

  lastIp?: string | null;
  ipAddresses?: string[];
  lastSeenAt?: Date | null;

  role: "user" | "admin";

  isEmailVerified: boolean;

  googleId?: string; // 🆕 Google OAuth

  verificationToken: string | null;
  verificationTokenExpires: Date | null;

  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;

  pinCode: string | null;
  pinCodeLookup?: string | null;
  pinCodeEncrypted?: string | null;

  comparePassword(candidate: string): Promise<boolean>;
  setPinCode(pin: string): Promise<void>;
  comparePinCode(candidate: string): Promise<boolean>;
}

/* =========================
   USER SCHEMA
========================= */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    // 🔑 Optional because of Google OAuth
    password: {
      type: String,
      required: false,
      select: false,
    },

    name: {
      type: String,
      default: null,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    lastIp: {
      type: String,
      default: null,
    },

    ipAddresses: {
      type: [String],
      default: [],
    },

    lastSeenAt: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // 🆕 Google OAuth ID
    googleId: {
      type: String,
      default: null,
      index: true,
    },

    verificationToken: {
      type: String,
      default: null,
      select: false,
    },

    verificationTokenExpires: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // 🔐 PIN (hashed)
    pinCode: {
      type: String,
      default: null,
      select: false,
    },

    // 🔐 PIN (encrypted for admin display)
    pinCodeEncrypted: {
      type: String,
      default: null,
      select: false,
    },

    // 🔎 Deterministic lookup hash for uniqueness checks
    pinCodeLookup: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
      index: true,
      select: false,
    },
  },
  { timestamps: true }
);

/* =========================
   PASSWORD HASHING
========================= */
UserSchema.pre<IUser>("save", async function () {
  // No password (Google user)
  if (!this.password) return;

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =========================
   INSTANCE METHODS
========================= */

// 🔑 Compare password
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// 🔐 Set PIN (hashed)
UserSchema.methods.setPinCode = async function (
  pin: string
): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  this.pinCode = await bcrypt.hash(pin, salt);
  this.pinCodeLookup = computePinLookup(pin);
  this.pinCodeEncrypted = encryptPin(pin);
};

// 🔐 Compare PIN
UserSchema.methods.comparePinCode = async function (
  candidate: string
): Promise<boolean> {
  if (!this.pinCode) return false;
  return bcrypt.compare(candidate, this.pinCode);
};

/* =========================
   EXPORT MODEL
========================= */
export default model<IUser>("User", UserSchema);
