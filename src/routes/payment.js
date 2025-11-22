import express from 'express';
import { createCheckoutSession, handlePaymentSuccess } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/success', protect, handlePaymentSuccess);

export default router;
