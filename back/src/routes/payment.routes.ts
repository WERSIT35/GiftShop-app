import { Router } from 'express';
import { createPayment } from '../controllers/payment.controller';

const router = Router();

// Public: start a payment for an order
router.post('/create', createPayment);

export default router;
