import express from 'express';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';
import {
    getAdminDashboard,
    getAllUsers,
    updateUser,
    deleteUser,
    getAllProducts,
    getAllOrders
} from '../controllers/adminController.js';

const router = express.Router();

// All routes are protected and admin-only
router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);

// User management
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

// Product management
router.get('/products', protect, authorize('admin'), getAllProducts);

// Order management
router.get('/orders', protect, authorize('admin'), getAllOrders);

export default router;
