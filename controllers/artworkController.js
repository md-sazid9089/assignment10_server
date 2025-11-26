
const Artwork = require('../models/Artwork');
const mongoose = require('mongoose');
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

exports.createArtwork = async (req, res) => {
  try {
    // Demo-mode: require userEmail and userName in the request body
    const bodyUserEmail = req.body && req.body.userEmail ? String(req.body.userEmail).toLowerCase() : null;
    const bodyUserName = req.body && req.body.userName ? String(req.body.userName) : null;

    if (!bodyUserEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required to create artwork'
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

    // Create artwork using client-provided demo user info
    const artwork = await Artwork.create({
      imageUrl,
      title,
      category,
      medium,
      description,
      dimensions: dimensions || null,
      price: price || null,
      visibility: visibility || 'Public',
      userName: bodyUserName || 'Anonymous',
      userEmail: bodyUserEmail
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


exports.getFeaturedArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ visibility: 'Public' })
      // For featured on the home page prefer newest artworks first
      .sort({ createdAt: -1 })
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

exports.getPublicArtworks = async (req, res) => {
  try {
    const { search, category, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    
    const query = { visibility: 'Public' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { medium: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }

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

exports.getArtworkById = async (req, res) => {
  try {
    const { id } = req.params;


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


exports.updateArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    const bodyUserEmail = req.body.userEmail;
    const userName = req.body.userName;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }
    const artwork = await Artwork.findById(id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }


    if (bodyUserEmail) {
      const normalizedBodyEmail = String(bodyUserEmail).toLowerCase();
      if (artwork.userEmail !== normalizedBodyEmail) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this artwork'
        });
      }
    }

    
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


exports.deleteArtwork = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bodyUserEmail = req.body && req.body.userEmail ? String(req.body.userEmail).toLowerCase() : null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artwork ID format'
      });
    }


    const artwork = await Artwork.findById(id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    
    if (bodyUserEmail && artwork.userEmail !== bodyUserEmail) {
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


exports.toggleLike = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.body && req.body.userEmail ? String(req.body.userEmail).toLowerCase() : null;

  if (!userEmail) {
    return res.status(400).json({ success: false, message: 'User email is required to like artwork' });
  }

  // Find artwork
  const artwork = await Artwork.findById(id);

  if (!artwork) {
    return res.status(404).json({
      success: false,
      message: 'Artwork not found'
    });
  }

  // Normalize stored likedBy entries for comparison
  const normalizedLikedBy = artwork.likedBy.map(e => (typeof e === 'string' ? e.toLowerCase() : e));
  const hasLiked = normalizedLikedBy.includes(userEmail);

  if (hasLiked) {
    // Unlike - remove user from likedBy and decrease count
    artwork.likedBy = artwork.likedBy.filter(email => (email || '').toLowerCase() !== userEmail);
    artwork.likesCount = Math.max(0, (artwork.likesCount || 0) - 1);
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
  }

  // Like - add user to likedBy and increase count
  artwork.likedBy.push(userEmail);
  artwork.likesCount = (artwork.likesCount || 0) + 1;
  await artwork.save();

  return res.json({
    success: true,
    message: 'Artwork liked successfully',
    data: {
      liked: true,
      likesCount: artwork.likesCount,
      artwork: artwork
    }
  });
};
