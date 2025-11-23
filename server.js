const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin (must be after dotenv.config()) 
require('./config/firebase');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_2
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routes
const artworkRoutes = require('./routes/artworkRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const userRoutes = require('./routes/userRoutes');

// Mount routes
app.use('/api/artworks', artworkRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Artify API is running' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// This file is now refactored for Vercel serverless deployment.
// API routes are handled in the /api directory as serverless functions.
