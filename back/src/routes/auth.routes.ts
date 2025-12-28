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

/* ======================
   Helpful 405 responses
====================== */
router.get("/login", (_req, res) =>
  res.status(405).json({ message: "Use POST /api/auth/login" })
);
router.get("/register", (_req, res) =>
  res.status(405).json({ message: "Use POST /api/auth/register" })
);

/* ======================
   Standard auth
====================== */
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);
router.get("/verify", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* ======================
   Google OAuth
====================== */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("🔥 GOOGLE CALLBACK HIT");
    next();
  },
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=google_failed`,
  }),
  (req: any, res) => {
    const token = signToken(req.user._id.toString());
    res.redirect(`${FRONTEND_URL}/login?token=${encodeURIComponent(token)}`);
  }
);

export default router;
