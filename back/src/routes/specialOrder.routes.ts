import { Router } from 'express';
import { createSpecialOrder } from '../controllers/specialOrder.controller';

const router = Router();

// Public: accept special/custom orders
router.post('/', createSpecialOrder);

export default router;
