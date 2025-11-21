import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import {
    getVendorDashboard,
    getVendorProducts,
    getVendorOrders
} from '../controllers/vendorController.js';

const router = express.Router();

// All routes are protected and vendor-only
router.get('/dashboard', protect, authorize('vendor'), getVendorDashboard);
router.get('/products', protect, authorize('vendor'), getVendorProducts);
router.get('/orders', protect, authorize('vendor'), getVendorOrders);

export default router;
