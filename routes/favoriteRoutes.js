// GET /api/favorites?userEmail=... or authenticated user
router.get('/', async (req, res, next) => {
  const emailFromUser = req.user?.email;
  const emailFromQuery = req.query.userEmail;
  const userEmail = emailFromUser || emailFromQuery;

  if (!userEmail) {
    return res.status(400).json({
      success: false,
      message: 'User email is required (provide ?userEmail=... or be logged in)',
    });
  }
  req.params.userEmail = userEmail;
  return getUserFavorites(req, res, next);
});
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
