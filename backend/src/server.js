import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';

dotenv.config();

export const createApp = async () => {
  const app = express();

  // Basic Middleware
  app.use(cors({
    origin: '*',
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Database
  try {
    await initDb();
  } catch (err) {
    console.error('Failed to initialize database on startup:', err);
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'StoreRate API is healthy and running',
      timestamp: new Date().toISOString()
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/stores', storeRoutes);
  app.use('/api/ratings', ratingRoutes);
  app.use('/api/owner', ownerRoutes);

  // Centralized Error Handling
  app.use(errorMiddleware);

  return app;
};

// Start standalone server if executed directly
if (process.env.STANDALONE === 'true' || process.argv[1]?.endsWith('server.js')) {
  const PORT = process.env.PORT || 5000;
  createApp().then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend server running on http://0.0.0.0:${PORT}`);
    });
  });
}

export default createApp;
