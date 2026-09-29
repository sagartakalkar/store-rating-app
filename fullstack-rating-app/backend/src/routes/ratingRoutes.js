import express from 'express';
import {
  submitRating,
  modifyRating,
  getStoreRatings
} from '../controllers/ratingController.js';
import {
  ratingValidation,
  updateRatingValidation
} from '../utils/validators.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/ratings/store/:storeId (Public / accessible to anyone)
router.get('/store/:storeId', getStoreRatings);

// POST /api/ratings (Authenticated users: submit rating)
router.post('/', authMiddleware, ratingValidation, submitRating);

// PUT /api/ratings/:id (Authenticated users: modify rating)
router.put('/:id', authMiddleware, updateRatingValidation, modifyRating);

export default router;
