import express from 'express';
import {
    getActivePopupAd,
    getAllPopupAds,
    createPopupAd,
    updatePopupAd,
    deletePopupAd,
    togglePopupAdStatus
} from '../controllers/popupAdController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/active', getActivePopupAd);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getAllPopupAds)
    .post(createPopupAd);

router.route('/:id')
    .put(updatePopupAd)
    .delete(deletePopupAd);

router.patch('/:id/toggle', togglePopupAdStatus);

export default router;
