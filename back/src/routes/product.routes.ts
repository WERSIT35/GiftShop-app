import { Router } from "express";

const router = Router();

// Example route
router.get("/", (req, res) => {
	res.send("Product route works!");
});

export default router;
