import express from 'express';
import cors from 'cors';
import { logger } from './config/logger.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info({ 
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body
  }, 'Incoming request');
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use((err, req, res, next) => {
  logger.error({ err }, 'Error occurred');
  res.status(500).json({ 
    error: 'Something broke!',
    message: err.message 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});