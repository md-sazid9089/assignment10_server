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

// Artwork routes - no authentication required

// Like routes - no authentication required


// More specific routes FIRST
router.get('/categories', getCategories);
router.get('/user/:email', getArtworksByUser);
router.get('/:id/is-liked/:email', checkLikeStatus);
router.get('/:id', getArtworkById);

// Public routes
router.get('/', getPublicArtworks);
router.get('/featured', getFeaturedArtworks);
router.get('/public', getPublicArtworks);

// Artwork routes
router.post('/', createArtwork);
router.put('/:id', updateArtwork);
router.delete('/:id', deleteArtwork);

// Like routes
router.patch('/:id/like', toggleLike);

module.exports = router;
