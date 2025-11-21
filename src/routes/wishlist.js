import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
} from '../controllers/wishlistController.js';

const router = express.Router();

router.route('/')
    .get(protect, getWishlist)
    .delete(protect, clearWishlist);

router.route('/:productId')
    .post(protect, addToWishlist)
    .delete(protect, removeFromWishlist);

export default router;
