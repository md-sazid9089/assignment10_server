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
// Public routes - no authentication required
router.get('/', getPublicArtworks);
router.get('/featured', getFeaturedArtworks);
router.get('/public', getPublicArtworks);
router.get('/categories', getCategories);
router.get('/:id', getArtworkById);

// Artwork routes - no authentication required
router.post('/', createArtwork);
router.get('/user/:email', getArtworksByUser);
router.put('/:id', updateArtwork);
router.delete('/:id', deleteArtwork);

// Like routes - no authentication required
router.patch('/:id/like', toggleLike);
router.get('/:id/is-liked/:email', checkLikeStatus);

module.exports = router;
