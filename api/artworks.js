// Vercel serverless CORS fix
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  // ...existing Express app logic...
  const express = require('express');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');
  const connectDB = require('../config/db');
  const dotenv = require('dotenv');

  dotenv.config();
  require('../config/firebase');
  connectDB();
  const artworkRoutes = require('../routes/artworkRoutes');
  const app = express();
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://artifyclient.netlify.app',
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
  app.use(artworkRoutes);
  return app(req, res);
};
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

const artworkRoutes = require('../routes/artworkRoutes');

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://artifyclient.netlify.app',
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
app.use(artworkRoutes);

module.exports = app;
