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

router.use(optionalAuth);

router.post('/toggle', toggleFavorite);

router.get('/check/:userEmail/:artworkId', checkFavoriteStatus);

router.post('/', addFavorite);
router.delete('/', removeFavorite);

router.get('/:userEmail/ids', getFavoriteIds);
router.get('/:userEmail/count', getFavoritesCount);
router.delete('/:userEmail/clear', clearAllFavorites);

router.get('/:userEmail', getUserFavorites);

module.exports = router;
