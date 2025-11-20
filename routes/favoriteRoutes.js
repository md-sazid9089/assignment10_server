const express = require('express');
const router = express.Router();
const {
  addFavorite,
  getUserFavorites,
  removeFavorite,
  toggleFavorite,
  checkFavoriteStatus,
  getFavoriteIds,
  getFavoritesCount,
  clearAllFavorites
} = require('../controllers/favoriteController');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/verifyFirebaseToken');

// All favorites routes require authentication
router.use(verifyFirebaseToken);

// Toggle favorite (add or remove)
router.post('/toggle', toggleFavorite);

// Check favorite status (can use optionalAuth if you want public access)
router.get('/check/:userEmail/:artworkId', checkFavoriteStatus);

// Add and remove favorites
router.post('/', addFavorite);
router.delete('/', removeFavorite);

// User-specific routes (must be before /:userEmail to avoid conflicts)
router.get('/:userEmail/ids', getFavoriteIds);
router.get('/:userEmail/count', getFavoritesCount);
router.delete('/:userEmail/clear', clearAllFavorites);

// Get all favorites for a user
router.get('/:userEmail', getUserFavorites);

module.exports = router;
