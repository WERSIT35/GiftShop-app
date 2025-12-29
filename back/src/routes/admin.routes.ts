import { Router } from "express";
import { isAdmin, protect } from "../middlewares/auth.middleware";
import * as adminController from "../controllers/admin.controller";

const router = Router();

// All routes below require admin
router.use(protect, isAdmin);

router.get("/users", adminController.listUsers);
router.get("/users/status", adminController.listUserStatuses);
router.post("/users", adminController.createUser);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/:id", adminController.updateUser);
router.get('/test', (req, res) => {
  res.json({ message: 'Admin test route works' });
});

console.log("Admin routes loaded");

export default router;
