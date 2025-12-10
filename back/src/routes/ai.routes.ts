import { Router } from "express";

const router = Router();

// Example route
router.get("/", (req, res) => {
	res.send("AI route works!");
});

export default router;
