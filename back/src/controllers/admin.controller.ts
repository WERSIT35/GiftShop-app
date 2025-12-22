import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcrypt";

// List all users
export const listUsers = async (req: Request, res: Response) => {
  const users = await User.find({}, "email name role isEmailVerified createdAt");
  res.json({ users });
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
