import { Router } from 'express';
import { createCheckout } from '../controllers/checkout.controller';

const router = Router();

// Public (guest checkout)
router.post('/', createCheckout);

export default router;
