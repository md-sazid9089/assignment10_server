const express = require('express');
const router = express.Router();
const {
  createArtwork,
  getFeaturedArtworks,
  getPublicArtworks,
  getArtworkById,
  getArtworksByUser,
  updateArtwork,
  deleteArtwork,
  toggleLike,
  getCategories,
  checkLikeStatus
} = require('../controllers/artworkController');
const { verifyFirebaseToken, optionalAuth } = require('../middleware/verifyFirebaseToken');

// Public routes - no authentication required
// GET /api/artworks - get all artworks (public)
router.get('/', getPublicArtworks);
router.get('/featured', getFeaturedArtworks);
router.get('/public', getPublicArtworks);
router.get('/categories', getCategories);
router.get('/:id', getArtworkById);

// Protected routes - authentication required
router.post('/', verifyFirebaseToken, createArtwork);
router.get('/user/:email', verifyFirebaseToken, getArtworksByUser);
router.put('/:id', verifyFirebaseToken, updateArtwork);
router.delete('/:id', verifyFirebaseToken, deleteArtwork);

// Like routes - authentication required
router.patch('/:id/like', verifyFirebaseToken, toggleLike);
router.get('/:id/is-liked/:email', optionalAuth, checkLikeStatus);

module.exports = router;
