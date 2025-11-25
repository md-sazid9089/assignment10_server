// @route   GET /api/artworks/categories
// @access  Public
const Artwork = require('../models/Artwork');
const mongoose = require('mongoose');

// @desc    Get all artwork categories
// @route   GET /api/artworks/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Artwork.distinct('category');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// @desc    Check if artwork is liked by user
// @route   GET /api/artworks/:id/is-liked/:email
// @access  Public
// @desc    Check if artwork is liked by user
// @route   GET /api/artworks/:id/is-liked/:email
// @access  Public
exports.checkLikeStatus = async (req, res) => {
  const { id, email } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid artwork ID format'
    });
  }
  try {
    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    const liked = artwork.likedBy.includes(email);
    res.json({
      success: true,
      liked
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check like status',
      error: error.message
    });
  }
};

// ...existing code...
// ...existing code...
// @desc    Get all artwork categories
// @route   GET /api/artworks/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Artwork.distinct('category');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// @desc    Check if artwork is liked by user
// @route   GET /api/artworks/:id/is-liked/:email
// @access  Public
exports.checkLikeStatus = async (req, res) => {
  const { id, email } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid artwork ID format'
    });
  }
  try {
    const artwork = await Artwork.findById(id);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    const liked = artwork.likedBy.includes(email);
    res.json({
      success: true,
      liked
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check like status',
      error: error.message
    });
  }
};
// ...existing code...
// @desc    Create new artwork
// @route   POST /api/artworks
// @access  Private (requires Firebase auth)
exports.createArtwork = async (req, res) => {
  try {
    // Require authenticated user
    const authEmail = req.user && req.user.email;
    const authName = req.user && (req.user.name || req.user.displayName || null);

    if (!authEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to create artwork'
      });
    }

    const {
      imageUrl,
      title,
      category,
      medium,
      description,
      dimensions,
      price,
      visibility
    } = req.body;

    // Validate required fields
    if (!imageUrl || !title || !category || !medium || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: imageUrl, title, category, medium, description'
      });
    }

    // Create artwork using server-verified user info
    const artwork = await Artwork.create({
      imageUrl,
      title,
      category,
      medium,
      description,
      dimensions: dimensions || null,
      price: price || null,
      visibility: visibility || 'Public',
      userName: authName || req.body.userName || 'Anonymous',
      userEmail: authEmail.toLowerCase()
    });

    res.status(201).json({
      success: true,
      message: 'Artwork created successfully',
      data: artwork
    });
  } catch (error) {
    console.error('Error creating artwork:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create artwork',
      error: error.message
    });
  }
};

// @desc    Get featured artworks (6 most recent)
// @route   GET /api/artworks/featured
// @access  Public
exports.getFeaturedArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ visibility: 'Public' })
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(6)
      .select('-__v');

    res.json({
      success: true,
      count: artworks.length,
      data: artworks
    });
  } catch (error) {
    console.error('Error fetching featured artworks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured artworks',
      error: error.message
    });
  }
};

// @desc    Get all public artworks with filters
// @route   GET /api/artworks/public
// @access  Public
exports.getPublicArtworks = async (req, res) => {
  try {
    const { search, category, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { visibility: 'Public' };

    // Search filter - case-insensitive regex on title and userName
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { medium: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Execute query with pagination
    const artworks = await Artwork.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Artwork.countDocuments(query);

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
    console.error('Error fetching public artworks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public artworks',
      error: error.message
    });
  }
};

// @desc    Get single artwork by ID
// @route   GET /api/artworks/:id
// @access  Public (but check visibility)
exports.getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    const artwork = await Artwork.findById(id).select('-__v');

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    res.json({
      success: true,
      data: artwork
    });
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artwork',
      error: error.message
    });
  }
};

// @desc    Get artworks by user email
// @route   GET /api/artworks/user/:email
// @access  Private (user's own artworks)
exports.getArtworksByUser = async (req, res) => {
  try {
    const { email } = req.params;
    const { limit = 50, page = 1, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const artworks = await Artwork.find({ userEmail: email })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Artwork.countDocuments({ userEmail: email });

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
    console.error('Error fetching user artworks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user artworks',
      error: error.message
    });
  }
};

// @desc    Update artwork
// @route   PUT /api/artworks/:id
// @access  Private (owner only)
exports.updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const bodyUserEmail = req.body.userEmail;
    const userName = req.body.userName;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    // Find artwork
    const artwork = await Artwork.findById(id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }
    // Use server-verified user email for ownership check when available.
    // Normalize to lowercase because `userEmail` is stored lowercased in the DB.
    // Do NOT trust client-sent `userEmail` for authorization (client can be tampered).
    const authEmail = req.user && req.user.email ? req.user.email.toLowerCase() : null;

    // Only enforce ownership when we have a verified authEmail
    if (authEmail && artwork.userEmail !== authEmail) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this artwork'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'imageUrl',
      'title',
      'category',
      'medium',
      'description',
      'dimensions',
      'price',
      'visibility',
      'userName'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        artwork[field] = req.body[field];
      }
    });

    await artwork.save();

    res.json({
      success: true,
      message: 'Artwork updated successfully',
      data: artwork
    });
  } catch (error) {
    console.error('Error updating artwork:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update artwork',
      error: error.message
    });
  }
};


// @desc    Delete artwork
// @route   DELETE /api/artworks/:id
// @access  Private (owner only)
exports.deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    // Use server-verified user email for ownership check (normalize to lowercase)
    const authEmail = req.user && req.user.email ? req.user.email.toLowerCase() : null;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }

    // Find artwork
    const artwork = await Artwork.findById(id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    if (!authEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check ownership using server-verified (lowercased) email
    if (artwork.userEmail !== authEmail) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this artwork'
      });
    }

    await Artwork.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Artwork deleted successfully',
      data: { id: artwork._id }
    });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete artwork',
      error: error.message
    });
  }
};

// @desc    Like/Unlike artwork
// @route   PATCH /api/artworks/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  const { id } = req.params;
  // Normalize authenticated email to lowercase to match how emails are stored
  const userEmail = req.user && req.user.email ? req.user.email.toLowerCase() : null;

  if (!userEmail) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Validate inputs
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid artwork ID format'
    });
  }

  // Find artwork
  const artwork = await Artwork.findById(id);

  if (!artwork) {
    return res.status(404).json({
      success: false,
      message: 'Artwork not found'
    });
  }

  // Check if user already liked
  // Normalize likedBy entries comparison by lowercasing stored emails during check
  const normalizedLikedBy = artwork.likedBy.map(e => (typeof e === 'string' ? e.toLowerCase() : e));
  const hasLiked = normalizedLikedBy.includes(userEmail);

  if (hasLiked) {
    // Unlike - remove user from likedBy and decrease count
    artwork.likedBy = artwork.likedBy.filter(email => (email || '').toLowerCase() !== userEmail);
    artwork.likesCount = Math.max(0, artwork.likesCount - 1);
        
    await artwork.save();

    return res.json({
      success: true,
      message: 'Like removed successfully',
      data: {
        liked: false,
        likesCount: artwork.likesCount,
        artwork: artwork
      }
    });
  } else {
    // Like - add user to likedBy and increase count
    // Ensure we push a lowercase email for consistency
    artwork.likedBy.push(userEmail);
  }

  await artwork.save();

  res.json({
    success: true,
    message: 'Artwork updated successfully',
    data: artwork
  });
}
