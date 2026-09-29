import express from 'express';
import jwt from 'jsonwebtoken';
import { getStores, getStoreById } from '../controllers/storeController.js';
import { query } from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'storerate-super-secret-jwt-key-change-in-production-12345678';

// Optional auth helper: attaches user if token provided, but doesn't block if not
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRes = await query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
      if (userRes.rows.length > 0) {
        req.user = userRes.rows[0];
      }
    } catch {
      // Ignore token failure for public store browsing
    }
  }
  next();
};

// GET /api/stores
router.get('/', optionalAuth, getStores);

// GET /api/stores/:id
router.get('/:id', optionalAuth, getStoreById);

export default router;
