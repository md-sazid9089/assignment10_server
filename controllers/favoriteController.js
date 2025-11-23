const Favorite = require('../models/Favorite');
const Artwork = require('../models/Artwork');
const mongoose = require('mongoose');

// @desc    Add artwork to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const userEmail = req.user.email; // Get from Firebase auth token
    const { artworkId } = req.body;

    // Validate required fields
    if (!artworkId) {
      return res.status(400).json({
        success: false,
        message: 'Artwork ID is required'
      });
    }

    // Validate artwork ID format
    if (!mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    // Check if artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({ userEmail, artworkId });
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Artwork is already in your favorites'
      });
    }

    // Create favorite
    const favorite = await Favorite.create({
      userEmail,
      artworkId
    });

    // Populate artwork details
    const populatedFavorite = await Favorite.findById(favorite._id).populate('artworkId');

    res.status(201).json({
      success: true,
      message: 'Artwork added to favorites successfully',
      data: populatedFavorite
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Artwork is already in your favorites'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add favorite',
      error: error.message
    });
  }
};

// @desc    Get all favorites for a user
// @route   GET /api/favorites/:userEmail
// @access  Private
exports.getUserFavorites = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { limit = 50, page = 1, sort = '-addedAt' } = req.query;
    const skip = (page - 1) * limit;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    // Get favorites with populated artwork data
    const favorites = await Favorite.find({ userEmail })
      .populate({
        path: 'artworkId',
        select: '-__v'
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out favorites where artwork was deleted
    const validFavorites = favorites.filter(fav => fav.artworkId !== null);

    // Map to array of artwork objects
    const artworks = validFavorites.map(fav => fav.artworkId);

    // Get total count
    const total = await Favorite.countDocuments({ userEmail });

    res.json({
      success: true,
      count: artworks.length,
      data: artworks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites',
      error: error.message
    });
  }
};

// @desc    Remove artwork from favorites
// @route   DELETE /api/favorites
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const userEmail = req.user.email; // Get from Firebase auth token
    const artworkId = req.body.artworkId || req.query.artworkId;

    // Validate required fields
    if (!artworkId) {
      return res.status(400).json({
        success: false,
        message: 'Artwork ID is required'
      });
    }

    // Validate artwork ID format
    if (!mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    // Find and delete favorite
    const result = await Favorite.deleteOne({ userEmail, artworkId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Artwork removed from favorites successfully'
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite',
      error: error.message
    });
  }
};

// @desc    Toggle favorite status (add or remove)
// @route   POST /api/favorites/toggle
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const userEmail = req.user.email; // Get from Firebase auth token
    const { artworkId } = req.body;

    // Validate required fields
    if (!artworkId) {
      return res.status(400).json({
        success: false,
        message: 'Artwork ID is required'
      });
    }

    // Validate artwork ID format
    if (!mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    // Check if artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({ userEmail, artworkId });

    if (existingFavorite) {
      // Remove from favorites
      await Favorite.deleteOne({ userEmail, artworkId });

      return res.json({
        success: true,
        message: 'Artwork removed from favorites',
        data: {
          action: 'removed',
          isFavorited: false
        }
      });
    } else {
      // Add to favorites
      const favorite = await Favorite.create({ userEmail, artworkId });
      const populatedFavorite = await Favorite.findById(favorite._id).populate('artworkId');

      return res.status(201).json({
        success: true,
        message: 'Artwork added to favorites',
        data: {
          action: 'added',
          isFavorited: true,
          favorite: populatedFavorite
        }
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite',
      error: error.message
    });
  }
};

// @desc    Check if artwork is favorited by user
// @route   GET /api/favorites/check/:userEmail/:artworkId
// @access  Public
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const { userEmail, artworkId } = req.params;

    // Validate artwork ID format
    if (!mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    const favorite = await Favorite.findOne({ userEmail, artworkId });

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite
      }
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check favorite status',
      error: error.message
    });
  }
};

// @desc    Get favorite artwork IDs for a user (quick lookup)
// @route   GET /api/favorites/:userEmail/ids
// @access  Private
exports.getFavoriteIds = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const favorites = await Favorite.find({ userEmail }).select('artworkId -_id');
    const favoriteIds = favorites.map(fav => fav.artworkId.toString());

    res.json({
      success: true,
      data: favoriteIds
    });
  } catch (error) {
    console.error('Error fetching favorite IDs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorite IDs',
      error: error.message
    });
  }
};

// @desc    Get count of user's favorites
// @route   GET /api/favorites/:userEmail/count
// @access  Private
exports.getFavoritesCount = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const count = await Favorite.countDocuments({ userEmail });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error counting favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to count favorites',
      error: error.message
    });
  }
};

// @desc    Clear all favorites for a user
// @route   DELETE /api/favorites/:userEmail/clear
// @access  Private
exports.clearAllFavorites = async (req, res) => {
  try {
    const { userEmail } = req.params;

    const result = await Favorite.deleteMany({ userEmail });

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} favorites successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear favorites',
      error: error.message
    });
  }
};
