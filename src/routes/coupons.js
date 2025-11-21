import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    createCoupon,
    getCoupons,
    validateCoupon,
    applyCoupon,
    deleteCoupon,
    updateCoupon
} from '../controllers/couponController.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'vendor'), getCoupons)
    .post(protect, authorize('admin', 'vendor'), createCoupon);

router.post('/validate', protect, validateCoupon);
router.post('/apply', protect, applyCoupon);

router.route('/:id')
    .put(protect, authorize('admin', 'vendor'), updateCoupon)
    .delete(protect, authorize('admin', 'vendor'), deleteCoupon);

export default router;
