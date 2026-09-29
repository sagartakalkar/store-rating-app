import express from 'express';
import {
  getDashboardStats,
  getUsers,
  createUser,
  getUserById,
  getStores,
  createStore
} from '../controllers/adminController.js';
import {
  createUserValidation,
  createStoreValidation
} from '../utils/validators.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin routes require ADMIN role
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// GET /api/admin/dashboard
router.get('/dashboard', getDashboardStats);

// GET /api/admin/users
router.get('/users', getUsers);

// POST /api/admin/users
router.post('/users', createUserValidation, createUser);

// GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// GET /api/admin/stores
router.get('/stores', getStores);

// POST /api/admin/stores
router.post('/stores', createStoreValidation, createStore);

export default router;
