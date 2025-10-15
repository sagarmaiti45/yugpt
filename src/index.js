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
// CORS configuration for Chrome extension and web access
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://www.youtube.com', 'https://youtube.com'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow if in allowed list or is a chrome-extension
    if (allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('chrome-extension://')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now (can be restricted later)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
  console.log(`✅ 4-Tier Transcript System Ready`);
});
