const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: {
      values: ['Painting', 'Sculpture', 'Digital Art', 'Photography', 'Drawing', 'Mixed Media', 'Illustration', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  medium: {
    type: String,
    required: [true, 'Medium is required'],
    trim: true,
    maxlength: [100, 'Medium cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  dimensions: {
    type: String,
    trim: true,
    default: null
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: null
  },
  visibility: {
    type: String,
    required: [true, 'Visibility is required'],
    enum: {
      values: ['Public', 'Private'],
      message: '{VALUE} is not a valid visibility option'
    },
    default: 'Public'
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  likesCount: {
    type: Number,
    default: 0,
    min: [0, 'Likes count cannot be negative']
  },
  likedBy: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      },
      message: 'Invalid email format in likedBy array'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
artworkSchema.index({ userEmail: 1, createdAt: -1 });
artworkSchema.index({ category: 1, visibility: 1 });
artworkSchema.index({ likesCount: -1 });
artworkSchema.index({ createdAt: -1 });

// Virtual for checking if artwork is liked
artworkSchema.virtual('isLiked').get(function() {
  return this.likedBy && this.likedBy.length > 0;
});

// Method to toggle like
artworkSchema.methods.toggleLike = function(userEmail) {
  const index = this.likedBy.indexOf(userEmail);
  
  if (index === -1) {
    // Add like
    this.likedBy.push(userEmail);
    this.likesCount += 1;
    return { liked: true, message: 'Artwork liked successfully' };
  } else {
    // Remove like
    this.likedBy.splice(index, 1);
    this.likesCount -= 1;
    return { liked: false, message: 'Like removed successfully' };
  }
};

// Method to check if user has liked
artworkSchema.methods.isLikedByUser = function(userEmail) {
  return this.likedBy.includes(userEmail);
};

// Pre-save middleware to update updatedAt
artworkSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Static method to get artworks by category
artworkSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ category, visibility: 'Public' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get featured artworks (most liked)
artworkSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ visibility: 'Public' })
    .sort({ likesCount: -1, createdAt: -1 })
    .limit(limit);
};

// Static method to get latest artworks
artworkSchema.statics.getLatest = function(limit = 10) {
  return this.find({ visibility: 'Public' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

const Artwork = mongoose.model('Artwork', artworkSchema);

module.exports = Artwork;
