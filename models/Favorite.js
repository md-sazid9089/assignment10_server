const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  artworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: [true, 'Artwork ID is required'],
    index: true
  },
  addedAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can't favorite the same artwork twice
favoriteSchema.index({ userEmail: 1, artworkId: 1 }, { unique: true });

// Index for efficient queries
favoriteSchema.index({ userEmail: 1, addedAt: -1 });

// Static method to add favorite
favoriteSchema.statics.addFavorite = async function(userEmail, artworkId) {
  try {
    const favorite = await this.create({ userEmail, artworkId });
    return {
      success: true,
      message: 'Artwork added to favorites',
      data: favorite
    };
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return {
        success: false,
        message: 'Artwork is already in favorites'
      };
    }
    throw error;
  }
};

// Static method to remove favorite
favoriteSchema.statics.removeFavorite = async function(userEmail, artworkId) {
  const result = await this.deleteOne({ userEmail, artworkId });
  
  if (result.deletedCount === 0) {
    return {
      success: false,
      message: 'Favorite not found'
    };
  }
  
  return {
    success: true,
    message: 'Artwork removed from favorites'
  };
};

// Static method to check if artwork is favorited by user
favoriteSchema.statics.isFavorited = async function(userEmail, artworkId) {
  const favorite = await this.findOne({ userEmail, artworkId });
  return !!favorite;
};

// Static method to get all favorites for a user
favoriteSchema.statics.getUserFavorites = function(userEmail, options = {}) {
  const { limit = 50, skip = 0, sort = { addedAt: -1 } } = options;
  
  return this.find({ userEmail })
    .populate('artworkId')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to count user's favorites
favoriteSchema.statics.countUserFavorites = function(userEmail) {
  return this.countDocuments({ userEmail });
};

// Static method to get favorite IDs for a user (for quick lookup)
favoriteSchema.statics.getUserFavoriteIds = async function(userEmail) {
  const favorites = await this.find({ userEmail }).select('artworkId -_id');
  return favorites.map(fav => fav.artworkId.toString());
};

// Virtual to populate artwork details
favoriteSchema.virtual('artwork', {
  ref: 'Artwork',
  localField: 'artworkId',
  foreignField: '_id',
  justOne: true
});

// Pre-remove middleware to handle cascading deletes if needed
favoriteSchema.pre('remove', function(next) {
  // Add any cleanup logic here if needed
  next();
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
