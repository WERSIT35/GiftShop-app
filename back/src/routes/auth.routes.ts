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

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/verify", verifyEmail);

// 🔐 PASSWORD RESET
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
