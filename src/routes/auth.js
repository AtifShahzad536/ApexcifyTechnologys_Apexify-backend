import express from 'express';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
