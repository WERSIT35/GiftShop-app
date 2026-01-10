import { Router } from "express";
import { isAdmin, protect } from "../middlewares/auth.middleware";
import * as adminController from "../controllers/admin.controller";

const router = Router();

// Admin-only routes (apply middleware per-route to avoid blocking other /api/* endpoints)
router.get("/users", protect, isAdmin, adminController.listUsers);
router.get("/users/status", protect, isAdmin, adminController.listUserStatuses);
router.post("/users", protect, isAdmin, adminController.createUser);
router.delete("/users/:id", protect, isAdmin, adminController.deleteUser);
router.put("/users/:id", protect, isAdmin, adminController.updateUser);
router.get('/test', (req, res) => {
  res.json({ message: 'Admin test route works' });
});

console.log("Admin routes loaded");

export default router;
