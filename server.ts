import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRoutes from './server/routes.ts';
import { getDatabase } from './server/db.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database on boot
  try {
    await getDatabase();
    console.log('SQLite database initialized and verified for ANSH CART.');
  } catch (err) {
    console.error('Failed to initialize SQLite database:', err);
  }

  // Middleware for parsing json and urlencoded data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes mounted FIRST
  app.use('/api', apiRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ANSH CART Server',
      database: 'SQLite',
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ANSH CART server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
