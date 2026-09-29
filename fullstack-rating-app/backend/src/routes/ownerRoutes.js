import express from 'express';
import {
  getOwnerDashboard,
  getOwnerRatings
} from '../controllers/ownerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// All owner routes require OWNER role
router.use(authMiddleware);
router.use(roleMiddleware(['OWNER']));

// GET /api/owner/dashboard
router.get('/dashboard', getOwnerDashboard);

// GET /api/owner/ratings
router.get('/ratings', getOwnerRatings);

export default router;
