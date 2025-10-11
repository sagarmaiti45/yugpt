import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import transcriptRoutes from './routes/transcript.js';
import summaryRoutes from './routes/summary.js';
import adminRoutes from './routes/admin.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Serve static files for admin panel
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'YuGPT API is running' });
});

app.use('/api/transcript', transcriptRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 YuGPT Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
