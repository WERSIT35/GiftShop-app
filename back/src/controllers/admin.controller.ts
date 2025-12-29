import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";
import { computePinLookup, decryptPin, generateRandomNumericPin } from "../utils/pin";
import type { AuthRequest } from "../middlewares/auth.middleware";

async function generateUniquePinCode(length = 6, maxAttempts = 25): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pin = generateRandomNumericPin(length);
    const lookup = computePinLookup(pin);
    const exists = await User.findOne({ pinCodeLookup: lookup }).select("_id").lean().exec();
    if (!exists) return pin;
  }
  throw new Error("Failed to generate a unique PIN code. Please try again.");
}

// List all users
export const listUsers = async (req: Request, res: Response) => {
  const onlineWindowMinutes = Number(process.env.ONLINE_WINDOW_MINUTES || 5);
  const onlineWindowMs = Math.max(1, onlineWindowMinutes) * 60 * 1000;

  const users = await User.find()
    .select(
      "email name role isEmailVerified createdAt avatarUrl googleId lastIp ipAddresses lastSeenAt +pinCodeEncrypted"
    )
    .exec();

  const usersWithPin: any[] = [];

  for (const user of users as any[]) {
    let pinCode: string | null = null;

    if (user.pinCodeEncrypted) {
      try {
        pinCode = decryptPin(user.pinCodeEncrypted);
      } catch {
        pinCode = null;
      }
    }

    // Backfill for legacy users created before encrypted PIN storage existed.
    if (!pinCode) {
      const pin = await generateUniquePinCode();
      await (user as any).setPinCode(pin);
      await user.save();
      pinCode = pin;
    }

    const u = user.toObject();
    delete u.pinCodeEncrypted;

    const lastSeenAt = u.lastSeenAt ? new Date(u.lastSeenAt) : null;
    let online = !!(lastSeenAt && Date.now() - lastSeenAt.getTime() <= onlineWindowMs);

    // If this user is the one making the request, they are online.
    const requesterId = (req as AuthRequest).userId;
    if (requesterId && String(u._id) === String(requesterId)) {
      online = true;
    }

    usersWithPin.push({
      ...u,
      pinCode,
      online,
    });
  }

  res.json({ users: usersWithPin });
};

// Create a new user (admin only)
export const createUser = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }
  const user = new User({
    email,
    password: await bcrypt.hash(password, 10),
    name,
    role: role || "user",
    isEmailVerified: true,
  });

  const pin = await generateUniquePinCode();
  await (user as any).setPinCode(pin);
  await user.save();
  res.status(201).json({ message: "User created", user: { email, name, role } });
};

// Delete a user by ID
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
};

// Update a user by ID
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, name, role, password } = req.body;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (email) user.email = email;
  if (name) user.name = name;
  if (role) user.role = role;
  if (password) user.password = await bcrypt.hash(password, 10);
  await user.save();
  res.json({ message: "User updated" });
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(); // Adjust if using a different ORM/DB
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
