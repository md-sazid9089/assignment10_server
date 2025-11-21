// Script to seed MongoDB with demo artworks from dummy_artworks.json
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Artwork = require('./models/Artwork');
const connectDB = require('./config/db');

async function seedArtworks() {
  await connectDB();
  const filePath = path.join(__dirname, 'dummy_artworks.json');
  const raw = fs.readFileSync(filePath);
  const artworks = JSON.parse(raw);

  // Remove all existing demo artworks (optional)
  await Artwork.deleteMany({ userEmail: 'demo@artify.com' });

  // Insert demo artworks
  await Artwork.insertMany(artworks);
  console.log('Demo artworks seeded!');
  mongoose.connection.close();
}

seedArtworks().catch((err) => {
  console.error('Seeding error:', err);
  mongoose.connection.close();
});
