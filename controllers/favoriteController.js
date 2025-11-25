const Favorite = require('../models/Favorite');
const Artwork = require('../models/Artwork');
const mongoose = require('mongoose');

exports.addFavorite = async (req, res) => {
  try {
    // Demo-mode: require userEmail in request body
    const userEmail = req.body.userEmail;
    const { artworkId } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    if (!artworkId) {
      return res.status(400).json({
        success: false,
        message: 'Artwork ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    const existingFavorite = await Favorite.findOne({ userEmail, artworkId });
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Artwork is already in your favorites'
      });
    }

    const favorite = await Favorite.create({
      userEmail,
      artworkId
    });

    const populatedFavorite = await Favorite.findById(favorite._id).populate('artworkId');

    res.status(201).json({
      success: true,
      message: 'Artwork added to favorites successfully',
      data: populatedFavorite
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    
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

    const favorites = await Favorite.find({ userEmail })
      .populate({
        path: 'artworkId',
        select: '-__v'
      })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const validFavorites = favorites.filter(fav => fav.artworkId !== null);
    const artworks = validFavorites.map(fav => fav.artworkId);
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

exports.removeFavorite = async (req, res) => {
  try {
    // Demo-mode: prefer body, then query
    const userEmail = req.body.userEmail || req.query.userEmail;
    const artworkId = req.body.artworkId || req.query.artworkId;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    if (!artworkId) {
      return res.status(400).json({
        success: false,
        message: 'Artwork ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

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

exports.toggleFavorite = async (req, res) => {
  try {
    // Demo-mode: require userEmail in body
    const userEmail = req.body.userEmail;
    const { artworkId } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    if (!artworkId) {
      return res.status(400).json({
        success: false,
        message: 'Artwork ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(artworkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

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

exports.checkFavoriteStatus = async (req, res) => {
  try {
    const { userEmail, artworkId } = req.params;

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
