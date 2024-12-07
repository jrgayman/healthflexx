import { Router } from 'express';
import { login, register, getCurrentUser, updateProfile } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Auth routes
router.post('/login', login);
router.post('/register', register);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);

export default router;