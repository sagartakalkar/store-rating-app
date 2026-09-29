import { createApp } from './backend/src/server.js';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  try {
    const app = await createApp();

    if (process.env.NODE_ENV === 'production') {
      const express = (await import('express')).default;
      const distPath = path.resolve(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    } else {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[StoreRate] Server successfully running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[StoreRate] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
