import { Router } from "express";
import passport from "passport";
import {
  register,
  login,
  me,
  verifyEmail,
  forgotPassword,
  resetPassword,
  signToken,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost";

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

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err: unknown, user: any) => {
    if (err) {
      const msg = encodeURIComponent("Google authentication failed");
      return res.redirect(`${FRONTEND_URL}/login?error=${msg}`);
    }
    if (!user) {
      const msg = encodeURIComponent("Google authentication denied");
      return res.redirect(`${FRONTEND_URL}/login?error=${msg}`);
    }

    const token = signToken((user._id ?? user.id).toString());
    return res.redirect(`${FRONTEND_URL}/login?token=${encodeURIComponent(token)}`);
  })(req, res, next);
});

export default router;
