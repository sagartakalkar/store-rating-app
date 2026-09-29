import express from 'express';
import {
  register,
  login,
  changePassword,
  getMe
} from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  changePasswordValidation
} from '../utils/validators.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, changePasswordValidation, changePassword);

// GET /api/auth/me
router.get('/me', authMiddleware, getMe);

export default router;
