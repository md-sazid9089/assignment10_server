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

// SPECIFIC ROUTES FIRST
router.get('/categories', getCategories);
router.get('/user/:email', getArtworksByUser);
router.get('/public', getPublicArtworks);
router.get('/featured', getFeaturedArtworks);

// Like status route (still more specific)
router.get('/:id/is-liked/:email', checkLikeStatus);

// DYNAMIC ROUTE AFTER ALL SPECIFIC ROUTES
router.get('/:id', getArtworkById);

// ROOT ROUTE LAST
router.get('/', getPublicArtworks);

// Artwork routes
router.post('/', createArtwork);
router.put('/:id', updateArtwork);
router.delete('/:id', deleteArtwork);

// Like routes
router.patch('/:id/like', toggleLike);

module.exports = router;
