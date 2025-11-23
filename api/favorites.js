const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('../config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
require('../config/firebase');

// Connect to MongoDB
connectDB();

const favoriteRoutes = require('../routes/favoriteRoutes');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_2
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(favoriteRoutes);

module.exports = app;
