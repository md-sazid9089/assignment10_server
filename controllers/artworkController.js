const Artwork = require('../models/Artwork');
const mongoose = require('mongoose');

// @desc    Create new artwork
// @route   POST /api/artworks
// @access  Private (assumed authenticated)
exports.createArtwork = async (req, res) => {
  try {
    const {
      imageUrl,
      title,
      category,
      medium,
      description,
      dimensions,
      price,
      visibility,
      userName,
      userEmail
    } = req.body;

    // Validate required fields
    if (!imageUrl || !title || !category || !medium || !description || !userName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: imageUrl, title, category, medium, description, userName, userEmail'
      });
    }

    // Create artwork
    const artwork = await Artwork.create({
      imageUrl,
      title,
      category,
      medium,
      description,
      dimensions: dimensions || null,
      price: price || null,
      visibility: visibility || 'Public',
      userName,
      userEmail
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
    const { userEmail, userName } = req.body;

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

    // Check ownership
    if (artwork.userEmail !== userEmail) {
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

    // Update only allowed fields
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
    const { userEmail } = req.body;

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

    // Check ownership
    if (artwork.userEmail !== userEmail) {
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
  try {
    const { id } = req.params;
    const userEmail = req.user.email; // Get from Firebase auth token

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
    const hasLiked = artwork.likedBy.includes(userEmail);

    if (hasLiked) {
      // Unlike - remove user from likedBy and decrease count
      artwork.likedBy = artwork.likedBy.filter(email => email !== userEmail);
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
      artwork.likedBy.push(userEmail);
      try {
        const { id } = req.params;
        const {
          title,
          category,
          medium,
          description,
          dimensions,
          price,
          visibility,
          imageUrl,
          userName,
          userEmail
        } = req.body;

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

        // Only allow update if userEmail matches
        if (artwork.userEmail !== userEmail) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to update this artwork'
          });
        }

        // Update artwork fields
        const updateFields = {
          title,
          category,
          medium,
          description,
          dimensions,
          price,
          visibility,
          imageUrl,
          userName,
          userEmail
        };

        Object.keys(updateFields).forEach(key => {
          if (updateFields[key] !== undefined) {
            artwork[key] = updateFields[key];
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
        res.status(500).json({
          success: false,
          message: 'Failed to update artwork',
          error: error.message
        });
      }
            return res.status(403).json({
              success: false,
              message: 'You do not have permission to delete this artwork'
            });
          }

          await artwork.remove();

          res.json({
            success: true,
            message: 'Artwork deleted successfully',
            data: artwork
          });
        } catch (error) {
          console.error('Error deleting artwork:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to delete artwork',
            error: error.message
          });
        }
