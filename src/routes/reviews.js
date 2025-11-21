import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateCreateReview } from '../validators/reviewValidator.js';
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, validateCreateReview, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
