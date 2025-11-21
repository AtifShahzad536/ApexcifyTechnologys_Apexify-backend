import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import { validateCreateOrder } from '../validators/orderValidator.js';
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus
} from '../controllers/orderController.js';

const router = express.Router();

// Protected routes
router.post('/', protect, validateCreateOrder, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('vendor', 'admin'), updateOrderStatus);

export default router;
