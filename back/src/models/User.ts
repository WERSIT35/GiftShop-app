import mongoose, { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

/* =========================
   USER INTERFACE
========================= */
export interface IUser extends Document {
  email: string;
  password: string;
  name: string | null;

  role: string; // 'user' | 'admin'

  isEmailVerified: boolean;

  verificationToken: string | null;
  verificationTokenExpires: Date | null;

  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;

  pinCode: string | null;

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

    password: {
      type: String,
      required: true,
      select: false, // ⛔ never returned unless explicitly selected
    },

    name: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
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
  },
  { timestamps: true }
);

/* =========================
   PASSWORD HASHING
========================= */
UserSchema.pre<IUser>("save", async function () {
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
  return bcrypt.compare(candidate, this.password);
};

// 🔐 Set PIN (hashed)
UserSchema.methods.setPinCode = async function (
  pin: string
): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  this.pinCode = await bcrypt.hash(pin, salt);
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
