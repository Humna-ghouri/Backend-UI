import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import loanRoute from './routes/loanRoute.js';
import pdfRoutes from './routes/pdfRoutes.js';
import dotenv from 'dotenv';
import connectDB from './db/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/loans', loanRoute);
app.use('/api/pdf', pdfRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    routes: ['/api/auth', '/api/loans', '/api/pdf'] 
  });
});

// Error handling (must be last)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET /api/health');
  console.log('- GET /api/pdf/test');
  console.log('- GET /api/pdf/:loanId');
});