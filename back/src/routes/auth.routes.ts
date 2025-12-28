import { Router } from "express";
import {
  register,
  login,
  me,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";

import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Helpful 405s for common mistaken GET requests
router.get("/login", (_req, res) => {
  return res.status(405).json({
    status: "error",
    message: "Method Not Allowed. Use POST /api/auth/login",
  });
});

router.get("/register", (_req, res) => {
  return res.status(405).json({
    status: "error",
    message: "Method Not Allowed. Use POST /api/auth/register",
  });
});

router.get("/forgot-password", (_req, res) => {
  return res.status(405).json({
    status: "error",
    message: "Method Not Allowed. Use POST /api/auth/forgot-password",
  });
});

router.get("/reset-password", (_req, res) => {
  return res.status(405).json({
    status: "error",
    message: "Method Not Allowed. Use POST /api/auth/reset-password",
  });
});

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/verify", verifyEmail);

// 🔐 PASSWORD RESET
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
