import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/initDb.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initSocket } from './socket/socketHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

// Route imports
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import industryRoutes from './routes/industryRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Express and Socket.IO
const httpServer = http.createServer(app);

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev access gracefully
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'JanSetu GovTech API Server (Prisma, Neon PostgreSQL & Socket.IO)',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/collaborations', collaborationRoutes);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use(errorHandler);

// Initialize Socket.io on HTTP Server
initSocket(httpServer, allowedOrigins);

// Start HTTP server and initialize database tables
const server = httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n======================================================`);
  console.log(`🏛️  JanSetu Backend Server & Socket.IO on port ${PORT}`);
  console.log(`🌐  API URL: http://localhost:${PORT}/api`);
  console.log(`⚡  Real-time Socket.IO: ws://localhost:${PORT}`);
  console.log(`======================================================\n`);

  try {
    await initializeDatabase();
  } catch (err) {
    console.error('Database bootstrap warning:', err.message);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use by another process. Please close existing node instances or change PORT in .env.`);
  } else {
    console.error('Server error:', err);
  }
});

export default app;
